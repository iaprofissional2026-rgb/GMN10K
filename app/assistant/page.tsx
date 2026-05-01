'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useFiles } from '@/app/context/FileContext';
import { useSettings } from '@/app/context/SettingsContext';
import { Bot, Send, User, Loader2, Database, Menu, Plus, MessageSquare, Trash2, X, Settings2, Key, ExternalLink, Cpu } from 'lucide-react';
import Markdown from 'react-markdown';
import Link from 'next/link';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const DEFAULT_MESSAGE: Message = {
  role: 'model',
  content: 'Olá! Sou seu Assistente especializado em Google Meu Negócio. Sei que nossa meta é fechar serviços com 20 empresas este mês. Estou integrado aos arquivos da sua Base de Conhecimento e pronto para ajudar a otimizar perfis, criar abordagens de prospecção matadoras e formular planos de ação. Qual é o perfil ou planejamento em que vamos trabalhar agora?',
};

export default function AssistantPage() {
  const { files } = useFiles();
  const { apiKey, setApiKey, apiTokensUsed, addTokensUsed } = useSettings();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([DEFAULT_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('gmn_chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          setMessages(parsed[0].messages);
        } else {
          createNewSession();
        }
      } catch (e) {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem('gmn_chat_sessions', JSON.stringify(updatedSessions));
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nova Conversa',
      messages: [DEFAULT_MESSAGE],
      updatedAt: Date.now(),
    };
    const updatedSessions = [newSession, ...sessions];
    saveSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages);
    setIsSidebarOpen(false);
  };

  const loadSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      setIsSidebarOpen(false);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter((s) => s.id !== id);
    if (updatedSessions.length === 0) {
      setSessions([]);
      createNewSession();
    } else {
      saveSessions(updatedSessions);
      if (currentSessionId === id || !currentSessionId) {
        setCurrentSessionId(updatedSessions[0].id);
        setMessages(updatedSessions[0].messages);
      }
    }
  };

  const updateCurrentSession = (newMessages: Message[]) => {
    setMessages(newMessages);
    
    // Auto-generate title based on first user message if title is default
    let newTitle = undefined;
    if (
      newMessages.length === 3 && 
      newMessages[1].role === 'user' && 
      sessions.find((s) => s.id === currentSessionId)?.title === 'Nova Conversa'
    ) {
      newTitle = newMessages[1].content.substring(0, 30) + (newMessages[1].content.length > 30 ? '...' : '');
    }

    const updatedSessions = sessions.map((s) => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: newMessages,
          updatedAt: Date.now(),
          title: newTitle || s.title,
        };
      }
      return s;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
    
    saveSessions(updatedSessions);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    updateCurrentSession(newMessages);
    setLoading(true);

    try {
      const activeApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!activeApiKey) {
        throw new Error('Chave de API não configurada. Configure sua chave nas configurações.');
      }

      const ai = new GoogleGenAI({ apiKey: activeApiKey });

      const processedFiles = files.filter((f) => f.status === 'Processado' && f.content);
      const fileContext = processedFiles
        .map((f) => `### Arquivo: ${f.name}\n${f.content}`)
        .join('\n\n');

      const trimmedFileContext = fileContext.substring(0, 30000); // Prevent payload too large

      const systemPromptText = `Você é um assistente estratégico expert em SEO Local e Google Meu Negócio (GMN).
O usuário é um profissional que trabalha otimizando perfis de empresas no GMN para aumentar as vendas e o SEO local delas, e tem a meta agressiva de fechar serviços com 20 empresas por mês.
Sua missão é ajudar o usuário a alcançar essa meta, fornecendo:
1. Dicas diretas e avançadas de otimização de fichas do GMN.
2. Argumentos de vendas focados em conversão e dor do cliente (para prospecção estruturada).
3. Resoluções práticas de análise de concorrentes e criação de planos de ação rápidos.

Responda em português (BR). Use Markdown (sem sintaxes markdown incompletas). Seja proativo, focado no aspecto comercial e dê exemplos práticos (templates de mensagens, estruturas de SEO on-page do mapa, etc).

Se o usuário mencionar ou pedir informações baseadas em arquivos, extraia as respostas do contexto dos arquivos abaixo. Se a informação não estiver lá, use seus sólidos conhecimentos em vendas e GMN sem alucinar sobre os arquivos.

ARQUIVOS NA BASE DE DADOS (${processedFiles.length} carregados):
${trimmedFileContext}`;

      const chatHistory = newMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPromptText }] },
          { role: 'model', parts: [{ text: 'Entendido. Usarei todas as informações para responder da melhor maneira possível.' }] },
          ...chatHistory,
        ],
      });

      if (response.text) {
        updateCurrentSession([...newMessages, { role: 'model', content: String(response.text) }]);
        if (response.usageMetadata?.totalTokenCount) {
          addTokensUsed(response.usageMetadata.totalTokenCount);
        }
      } else {
        throw new Error('A inteligência artificial não retornou dados.');
      }
    } catch (err: any) {
      console.error(err);
      updateCurrentSession([
        ...newMessages,
        { role: 'model', content: `Ocorreu um erro ao processar sua resposta: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeFilesCount = files.length;

  return (
    <div className="fixed inset-0 pb-16 md:relative md:pb-0 flex md:h-full overflow-hidden bg-[#0A0F14] z-20">
      {/* History Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/90 backdrop-blur-xl border-r border-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.1)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-slate-100 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" /> Histórico
            </h2>
            <button className="md:hidden p-1 text-slate-400 hover:text-emerald-400 transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4">
            <button 
              onClick={createNewSession}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-white font-medium text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-400/20"
            >
              <Plus className="h-4 w-4" /> Nova Conversa
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 relative z-10 custom-scrollbar mt-2">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                onClick={() => loadSession(session.id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentSessionId === session.id ? 'bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="overflow-hidden">
                  <p className={`text-sm font-medium truncate transition-colors ${currentSessionId === session.id ? 'text-emerald-400' : 'text-slate-300 group-hover:text-emerald-100'}`}>
                    {session.title}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(session.updatedAt).toLocaleDateString()} {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button 
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/5 bg-[#0A0F14]/80 backdrop-blur-md flex-shrink-0 relative z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-1.5 bg-slate-800/80 border border-white/10 rounded-md text-slate-300 hover:bg-slate-700 hover:text-emerald-400 transition"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-2 rounded-lg border border-emerald-500/30 hidden md:flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-slate-100 leading-tight text-lg tracking-wide">Assistente <span className="text-emerald-400">GMN</span></h1>
              <p className="text-[11px] md:text-xs text-emerald-500/70 mt-0.5 uppercase tracking-wider font-semibold">Inteligência de Vendas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempApiKey(apiKey);
                setIsSettingsOpen(true);
              }}
              className="flex items-center justify-center p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-emerald-500/20 hover:border-emerald-500/50 transition-all tooltip-trigger relative group text-emerald-400/80 hover:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
              title="Configurações da API"
            >
              <Settings2 className="h-5 w-5" />
            </button>
            <Link 
              href="/knowledge" 
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800/80 border border-emerald-500/20 hover:border-emerald-500/50 rounded-md transition-all text-emerald-100 hover:text-white shadow-[0_0_10px_rgba(16,185,129,0.05)]"
            >
              <Database className="h-4 w-4 text-emerald-400/80" />
              <span className="text-xs font-medium hidden sm:inline">
                {activeFilesCount} Arquivos
              </span>
            </Link>
          </div>
        </div>

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1722] border border-emerald-500/30 rounded-xl w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center p-4 border-b border-emerald-500/10 bg-emerald-500/5">
                <h3 className="font-heading font-semibold text-emerald-50 flex items-center gap-2">
                  <Key className="h-4 w-4 text-emerald-400" /> Configuração da API Gemini
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-emerald-400 p-1 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-emerald-100/70 mb-1">
                    Sua Chave API (Opcional)
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="w-full rounded-lg bg-black/50 border border-emerald-500/20 px-3 py-2 text-emerald-50 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono text-sm shadow-inner"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Se você não fornecer uma chave, o assistente tentará usar a chave padrão do sistema.
                  </p>
                </div>

                <div className="bg-black/40 p-4 rounded-lg border border-emerald-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-teal-500" /> Uso da API
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {apiTokensUsed.toLocaleString()} tokens
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    O consumo total de tokens computado localmente no seu navegador.
                  </p>
                </div>

                <div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-teal-400 hover:text-emerald-300 transition-colors w-fit group"
                  >
                    <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    Obter nova chave API Gemini
                  </a>
                </div>
              </div>
              <div className="p-4 border-t border-emerald-500/10 flex justify-end gap-3 bg-emerald-500/5">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-emerald-200/60 hover:text-emerald-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    setApiKey(tempApiKey);
                    setIsSettingsOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar relative z-10 w-full mb-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col max-w-3xl ${
                msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div className={`flex items-center gap-2 mb-1.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex items-center justify-center h-6 w-6 rounded-full shrink-0 ${
                  msg.role === 'user' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                }`}>
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 select-none">
                  {msg.role === 'user' ? 'Você' : 'GMN Assist'}
                </span>
              </div>
              
              <div
                className={`px-5 py-3.5 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-slate-100 rounded-tr-sm shadow-sm'
                    : 'bg-[#111A22]/90 border border-emerald-500/20 text-emerald-50 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap text-[14.5px] leading-relaxed break-words font-medium">
                    {msg.content}
                  </div>
                ) : (
                  <div className="prose prose-sm prose-invert prose-emerald max-w-none break-words leading-relaxed text-[14.5px]">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex flex-col max-w-3xl mr-auto items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center justify-center h-6 w-6 rounded-full shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 select-none">GMN Assist</span>
              </div>
              <div className="bg-[#111A22]/90 border border-emerald-500/20 px-6 py-4 rounded-2xl rounded-tl-sm flex items-center justify-center min-w-[80px] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-5 bg-gradient-to-t from-[#0A0F14] to-[#0A0F14]/80 backdrop-blur-xl border-t border-emerald-500/10 shrink-0 relative z-20">
          <div className="max-w-4xl mx-auto flex items-center p-1.5 md:p-2 rounded-xl bg-black/40 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)] focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 w-full group">
            <input
              type="text"
              placeholder="Digite o perfil do cliente ou sua estratégia..."
              className="flex-1 bg-transparent border-none px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-[15px] font-medium text-emerald-50 placeholder:text-slate-500 focus:outline-none focus:ring-0 w-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex shrink-0 items-center justify-center h-10 w-10 md:h-11 md:w-11 md:ml-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white transition-all hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:opacity-50 disabled:shadow-none shadow-[0_0_15px_rgba(16,185,129,0.4)] group-focus-within:shadow-[0_0_20px_rgba(16,185,129,0.6)]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
            </button>
          </div>
          <div className="text-center mt-2.5 hidden md:block">
            <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
              <span>IA Orientada a Conversão</span> &middot; <span>Cruza Dados dos Arquivos Base</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
