'use client';

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MessageSquare, Phone, Send, Loader2, Sparkles, Zap, Copy } from 'lucide-react';
import Markdown from 'react-markdown';
import { BackButton } from '@/components/BackButton';
import { useSettings } from '@/app/context/SettingsContext';

export default function Prospecting() {
  const { apiKey, addTokensUsed } = useSettings();
  const [niche, setNiche] = useState('');
  const [leadName, setLeadName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState({
    presentation: '',
    followUp: '',
    closing: ''
  });
  const [error, setError] = useState('');

  const generateScripts = async () => {
    if (!niche || !leadName) {
      setError('Por favor, preencha o nicho e o nome do lead.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const activeApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!activeApiKey) {
        throw new Error('Chave da API do Gemini não configurada.');
      }

      const ai = new GoogleGenAI({ apiKey: activeApiKey });
      
      const prompt = `Você é um vendedor especialista de serviços de SEO Local e Google Meu Negócio. 
Eu preciso prospectar um lead via WhatsApp.
Lead: ${leadName}
Nicho: ${niche}
Ticket: R$ 250,00 mensal
Promessa: Aumento de visibilidade e clientes em 30 dias.

Por favor retorne 3 mensagens SEPARADAS pelas tags [PRESENTATION], [FOLLOW_UP] e [CLOSING].
Não adicione formatação markdown fora das tags, use emojis no texto.

Gere:
[PRESENTATION]
Mensagem curta de abordagem inicial, apontando um problema que ele pode ter no Google e gerando curiosidade.

[FOLLOW_UP]
Mensagem para enviar 2 dias depois se ele não responder. Gerar conexão e mandar uma estatística sobre o nicho de ${niche} no Google.

[CLOSING]
Script de fechamento com gatilho de urgência (vagas limitadas na agenda da agência) e prova social.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      
      const presMatch = text.match(/\\[PRESENTATION\\]\\s*([^\\n](?:[\\s\\S]*?))(?:\\n\\s*\\[FOLLOW_UP\\]|$)/i);
      const followMatch = text.match(/\\[FOLLOW_UP\\]\\s*([^\\n](?:[\\s\\S]*?))(?:\\n\\s*\\[CLOSING\\]|$)/i);
      const closeMatch = text.match(/\\[CLOSING\\]\\s*([\\s\\S]+)$/i);

      setScripts({
        presentation: presMatch ? presMatch[1].trim() : 'Erro ao extrair apresentação',
        followUp: followMatch ? followMatch[1].trim() : 'Erro ao extrair follow up',
        closing: closeMatch ? closeMatch[1].trim() : 'Erro ao extrair fechamento'
      });
      
      if (response.usageMetadata?.totalTokenCount) {
        addTokensUsed(response.usageMetadata.totalTokenCount);
      }
      
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao gerar os scripts.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (text: string) => {
    const defaultPhone = phone.replace(/\\D/g, '') || '55YOURNUMBER';
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${defaultPhone}?text=${encodedText}`, '_blank');
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app we'd trigger a toast notification here
  };

  return (
    <div className="p-4 md:p-8 pb-32 md:pb-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-white">Prospecção WhatsApp</h1>
        <p className="mt-2 text-xs md:text-sm text-slate-400">
          Scripts de abordagem focados em conversão e fechamento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Painel de Configuração */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Lead
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome (Lead/Empresa)</label>
                <input 
                  type="text" 
                  className="w-full rounded-md border border-white/20 bg-black/20 focus:bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Ex: João da Borracharia"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nicho</label>
                <input 
                  type="text" 
                  className="w-full rounded-md border border-white/20 bg-black/20 focus:bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Ex: Oficinas Mecânicas"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp (Opcional)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-white/20 bg-black/20 focus:bg-white/5 pl-10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="55 11 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <button 
                onClick={generateScripts}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-600 disabled:bg-teal-500/50"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Gerando Textos...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Gerar Sequência</>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-5 backdrop-blur-sm">
            <h3 className="text-teal-300 font-semibold mb-2">Dica do Funil</h3>
            <p className="text-sm text-teal-100/80">
              O ticket médio alvo é <strong>R$ 250/cliente</strong>. Mostre com provas sociais que o investimento volta em formato de clientes logo nas primeiras semanas de visibilidade em mapas!
            </p>
          </div>
        </div>

        {/* Áreas de Script */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {scripts.presentation ? (
            <>
              {/* Apresentação */}
              <ScriptBox 
                title="Mensagem de Apresentação" 
                text={scripts.presentation} 
                onSend={() => openWhatsApp(scripts.presentation)} 
                onCopy={() => copyText(scripts.presentation)} 
              />
              
              {/* Follow Up */}
              <ScriptBox 
                title="Follow-Up (Após 2-3 dias)" 
                text={scripts.followUp} 
                onSend={() => openWhatsApp(scripts.followUp)} 
                onCopy={() => copyText(scripts.followUp)} 
              />
              
              {/* Fechamento */}
              <ScriptBox 
                title="Script de Fechamento" 
                text={scripts.closing} 
                onSend={() => openWhatsApp(scripts.closing)} 
                onCopy={() => copyText(scripts.closing)} 
              />
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center min-h-[400px] text-slate-400 p-8 h-full backdrop-blur-sm">
              <MessageSquare className="h-16 w-16 text-slate-600 mb-4" />
              <p className="font-medium text-slate-300">Seus scripts aparecerão aqui</p>
              <p className="text-sm mt-1">Gere abordagens otimizadas com técnicas de conversão e urgência.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScriptBox({ title, text, onSend, onCopy }: { title: string, text: string, onSend: () => void, onCopy: () => void }) {
  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm overflow-hidden">
      <div className="bg-white/5 px-5 py-3 border-b border-white/10">
        <h3 className="font-heading font-semibold text-slate-100">{title}</h3>
      </div>
      <div className="p-5">
        <div className="whitespace-pre-wrap text-slate-300 text-sm">
          {text}
        </div>
      </div>
      <div className="bg-white/5 px-5 py-3 border-t border-white/10 flex justify-end gap-3">
        <button 
          onClick={onCopy}
          className="flex items-center text-slate-300 bg-white/5 border border-white/20 hover:bg-white/10 text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copiar
        </button>
        <button 
          onClick={onSend}
          className="flex items-center text-white bg-teal-500 hover:bg-teal-600 text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
        >
          <Send className="h-4 w-4 mr-2" />
          Enviar no Whats
        </button>
      </div>
    </div>
  );
}
