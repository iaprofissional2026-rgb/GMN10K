'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useFiles } from '@/app/context/FileContext';
import { useSettings } from '@/app/context/SettingsContext';
import { supabase } from '@/lib/supabase';
import { Bot, Send, User, Loader2, Database, Menu, Plus, MessageSquare, Trash2, X, Settings2, Key, ExternalLink, Cpu, Copy, Check, Download, Image as ImageIcon, Sparkles, Paperclip } from 'lucide-react';
import Markdown from 'react-markdown';
import Link from 'next/link';

interface Message {
  role: 'user' | 'model';
  content: string;
  image?: string; // Base64 image
  isImageAction?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  type: 'gmn' | 'general';
}

const GMN_DEFAULT_MESSAGE: Message = {
  role: 'model',
  content: 'Olá! Sou seu Assistente GMN PRO. Vamos fechar negócios hoje? Analiso seus arquivos, imagens e ajudo com SEO Local e prospecção de alto impacto. Qual empresa vamos dominar hoje?',
};

const GENERAL_DEFAULT_MESSAGE: Message = {
  role: 'model',
  content: 'Oi! Sou seu assistente expert. Precisa de fórmulas complexas, análise de dados ou melhorar uma imagem para ficar em 4K profissional? Estou aqui para ajudar.',
};

export default function AssistantPage() {
  const { files } = useFiles();
  const { apiKey, setApiKey, generalApiKey, setGeneralApiKey, apiTokensUsed, addTokensUsed } = useSettings();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([GMN_DEFAULT_MESSAGE]);
  const [assistantType, setAssistantType] = useState<'gmn' | 'general'>('gmn');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempGeneralApiKey, setTempGeneralApiKey] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userEmail = 'souturbo149@gmail.com';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveSessionsToSupabase = useCallback(async (updatedSessions: ChatSession[]) => {
    try {
      if (!supabase) return;
      await supabase
        .from('chats')
        .upsert(updatedSessions.map(s => ({
          id: s.id,
          title: s.title,
          messages: s.messages,
          type: s.type,
          user_email: userEmail,
          updated_at: new Date(s.updatedAt).toISOString()
        })));
    } catch (err) {
      console.error('Error saving sessions to Supabase:', err);
    }
  }, [userEmail]);

  const createNewSession = useCallback(async (type: 'gmn' | 'general' = 'gmn') => {
    const defaultMsg = type === 'gmn' ? GMN_DEFAULT_MESSAGE : GENERAL_DEFAULT_MESSAGE;
    const newSession: ChatSession = {
      id: `${userEmail}_${Date.now()}`,
      title: type === 'gmn' ? 'Assistente GMN' : 'Assistente Geral',
      messages: [defaultMsg],
      updatedAt: Date.now(),
      type: type,
    };
    
    setSessions(prev => {
      const updated = [newSession, ...prev];
      localStorage.setItem('gmn_chat_sessions', JSON.stringify(updated));
      saveSessionsToSupabase(updated);
      return updated;
    });
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages);
    setAssistantType(type);
    setIsSidebarOpen(false);
  }, [saveSessionsToSupabase, userEmail]);

  useEffect(() => {
    const loadSessions = async () => {
      const savedSessions = localStorage.getItem('gmn_chat_sessions');
      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions);
          if (parsed.length > 0) {
            setSessions(parsed);
            setCurrentSessionId(parsed[0].id);
            setMessages(parsed[0].messages);
            setAssistantType(parsed[0].type || 'gmn');
          }
        } catch (e) {}
      }

      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('user_email', userEmail)
          .order('updated_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
          const mappedSessions: ChatSession[] = data.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type || 'gmn',
            messages: item.messages || (item.type === 'general' ? [GENERAL_DEFAULT_MESSAGE] : [GMN_DEFAULT_MESSAGE]),
            updatedAt: new Date(item.updated_at).getTime()
          }));
          setSessions(mappedSessions);
          setCurrentSessionId(mappedSessions[0].id);
          setMessages(mappedSessions[0].messages);
          setAssistantType(mappedSessions[mappedSessions.length - 1].type || 'gmn');
          localStorage.setItem('gmn_chat_sessions', JSON.stringify(mappedSessions));
        } else if (!savedSessions) {
          createNewSession();
        }
      } catch (err) {
        if (!savedSessions) createNewSession();
      }
    };
    
    loadSessions();
  }, [createNewSession, userEmail]);

  const loadSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      setAssistantType(session.type || 'gmn');
      setIsSidebarOpen(false);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter((s) => s.id !== id);
    
    try {
      await supabase.from('chats').delete().eq('id', id).eq('user_email', userEmail);
    } catch (err) {}

    if (updatedSessions.length === 0) {
      setSessions([]);
      createNewSession();
    } else {
      setSessions(updatedSessions);
      localStorage.setItem('gmn_chat_sessions', JSON.stringify(updatedSessions));
      if (currentSessionId === id || !currentSessionId) {
        setCurrentSessionId(updatedSessions[0].id);
        setMessages(updatedSessions[0].messages);
        setAssistantType(updatedSessions[0].type || 'gmn');
      }
    }
  };

  const updateCurrentSession = async (newMessages: Message[]) => {
    setMessages(newMessages);
    const currentSession = sessions.find((s) => s.id === currentSessionId);
    
    const sessionToUpdate: ChatSession = {
      ...(currentSession || { 
        id: currentSessionId, 
        title: assistantType === 'gmn' ? 'Assistente GMN' : 'Assistente Geral',
        type: assistantType as 'gmn' | 'general',
        messages: newMessages,
        updatedAt: Date.now()
      }),
      messages: newMessages,
      updatedAt: Date.now(),
      title: currentSession?.title && currentSession.title !== 'Nova Conversa' ? currentSession.title : (newMessages[1]?.content?.substring(0, 30) || 'Nova Conversa'),
    };

    const updatedSessions = sessions.map((s) => {
      if (s.id === currentSessionId) return sessionToUpdate;
      return s;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
    
    if (!sessions.find(s => s.id === currentSessionId)) {
      updatedSessions.unshift(sessionToUpdate);
    }

    setSessions(updatedSessions);
    localStorage.setItem('gmn_chat_sessions', JSON.stringify(updatedSessions));
    saveSessionsToSupabase(updatedSessions);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMsg = input.trim();
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    
    const newMessages: Message[] = [...messages, { 
      role: 'user', 
      content: userMsg || (currentImage ? 'Analise esta imagem' : ''), 
      image: currentImage || undefined 
    }];
    updateCurrentSession(newMessages);
    setLoading(true);

    try {
      const activeApiKey = assistantType === 'gmn' ? apiKey : (generalApiKey || apiKey);
      if (!activeApiKey) throw new Error('Chave de API não configurada.');

      const client = new GoogleGenAI({ apiKey: activeApiKey });

      // Image Improvement Logic
      const improveKeywords = ['melhorar imagem', 'profissional', '4k', 'melhoria', 'enhance'];
      const wantsImprovement = improveKeywords.some(keyword => userMsg.toLowerCase().includes(keyword)) && currentImage;

      if (wantsImprovement) {
        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: currentImage.split(',')[1], mimeType: "image/png" } },
              { text: `Redesenhe esta imagem como uma fotografia profissional 4K, iluminação ultra realística, nitidez extrema. ${userMsg}` },
            ],
          },
          config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
        });
        
        let improvedBase64 = '';
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) { improvedBase64 = part.inlineData.data; break; }
        }

        if (improvedBase64) {
          updateCurrentSession([...newMessages, { role: 'model', content: "Elevei sua imagem ao nível profissional 4K.", image: `data:image/png;base64,${improvedBase64}`, isImageAction: true }]);
          setLoading(false);
          return;
        }
      }

      // Standard Multimodal Generation
      let modelToUse = assistantType === 'gmn' ? 'gemini-3-flash-preview' : 'gemini-3.1-pro-preview';
      
      const chatHistory = newMessages.slice(1).map((msg) => {
        const parts: any[] = [{ text: msg.content }];
        if (msg.image) parts.push({ inlineData: { data: msg.image.split(',')[1], mimeType: "image/png" } });
        return { role: msg.role, parts };
      });

      const response = await client.models.generateContent({
        model: modelToUse,
        contents: [
          { role: 'user', parts: [{ text: `Aja como um assistente expert. Se houver imagens, analise-as detalhadamente.` }] },
          ...chatHistory
        ],
      });

      updateCurrentSession([...newMessages, { role: 'model', content: response.text || "" }]);
    } catch (err: any) {
      updateCurrentSession([...newMessages, { role: 'model', content: `Erro: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 pb-[72px] md:relative md:pb-0 flex md:h-full overflow-hidden bg-slate-950 z-20">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)] animate-pulse-slow"></div>
      </div>

      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/90 backdrop-blur-xl border-r border-emerald-500/10 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-slate-100 flex items-center gap-2 italic">
              <MessageSquare className="h-4 w-4 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> HISTÓRICO
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <button onClick={() => createNewSession('gmn')} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold text-xs uppercase shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">NOVO GMN</button>
            <button onClick={() => createNewSession('general')} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold text-xs uppercase transition-all">GERAL EXPERT</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
            {sessions.map(s => (
              <div key={s.id} onClick={() => loadSession(s.id)} className={`p-3 rounded-lg cursor-pointer transition-all border ${currentSessionId === s.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'border-transparent hover:bg-white/5'}`}>
                <p className="text-sm font-medium truncate text-slate-300">{s.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#0D1219]/90 backdrop-blur-md relative z-20 shadow-2xl">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-slate-300" onClick={() => setIsSidebarOpen(true)}><Menu /></button>
            <Bot className="h-6 w-6 text-emerald-400" />
            <h1 className="font-bold text-lg">ASSISTENTE <span className="text-emerald-400">PRO</span></h1>
          </div>
          <Settings2 className="h-5 w-5 text-slate-400 cursor-pointer" onClick={() => setIsSettingsOpen(true)} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col max-w-3xl ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-slate-800' : 'bg-slate-900 border border-emerald-500/20 shadow-glow'} relative group/msg overflow-hidden`}>
                {msg.image && <img src={msg.image} className="rounded-lg mb-2 max-w-sm" />}
                <div className="prose prose-invert prose-sm text-slate-200">
                  <Markdown>{msg.content}</Markdown>
                </div>
                
                {/* Message Actions */}
                <div className={`absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 ${msg.role === 'user' ? 'hidden' : ''}`}>
                  <button 
                    onClick={() => copyToClipboard(msg.content, `msg-${i}`)}
                    className="p-1.5 bg-black/40 hover:bg-emerald-500/20 rounded-md transition-colors text-slate-400 hover:text-emerald-400"
                    title="Copiar mensagem"
                  >
                    {copiedId === `msg-${i}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  {msg.content.includes('```') && (
                    <button 
                      onClick={() => {
                        const match = msg.content.match(/```([\s\S]*?):([\s\S]*?)\n([\s\S]*?)```/);
                        if (match) downloadFile(match[3], match[2]);
                      }}
                      className="p-1.5 bg-black/40 hover:bg-emerald-500/20 rounded-md transition-colors text-slate-400 hover:text-emerald-400"
                      title="Baixar arquivo"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && <Loader2 className="h-6 w-6 animate-spin text-emerald-400 mx-auto" />}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 relative z-20">
          <div className="max-w-4xl mx-auto space-y-2">
            {selectedImage && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-emerald-500"><img src={selectedImage} className="w-full h-full object-cover" /><X className="absolute top-1 right-1 h-4 w-4 bg-black rounded-full cursor-pointer" onClick={() => setSelectedImage(null)} /></div>
            )}
            <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-2xl border border-white/10 focus-within:border-emerald-500/50 shadow-2xl">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
              <Paperclip className="h-5 w-5 text-slate-400 cursor-pointer hover:text-emerald-400 ml-2" onClick={() => fileInputRef.current?.click()} />
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Envie uma imagem ou mensagem..." className="flex-1 bg-transparent border-none text-slate-100 placeholder:text-slate-500 focus:outline-none" />
              <button onClick={handleSend} className="p-2 bg-emerald-600 rounded-xl text-white hover:scale-105 transition-all"><Send className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
