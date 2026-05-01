'use client';

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Target, Loader2, Sparkles, AlertCircle, Building2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { BackButton } from '@/components/BackButton';
import { useSettings } from '@/app/context/SettingsContext';

export default function Actions() {
  const { apiKey, addTokensUsed } = useSettings();
  const [niche, setNiche] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');
  const [error, setError] = useState('');

  const generatePlan = async () => {
    if (!niche || !clientName) {
      setError('Por favor, preencha o nome do cliente e o nicho.');
      return;
    }
    
    setError('');
    setLoading(true);
    setPlan('');

    try {
      const activeApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!activeApiKey) {
        throw new Error('Chave da API do Gemini não configurada.');
      }

      const ai = new GoogleGenAI({ apiKey: activeApiKey });
      
      const prompt = `
Você é um especialista em SEO Local e Google Meu Negócio. 
Utilize as melhores práticas do mercado e nossa base de conhecimento para gerar um plano de ação rápido para:
Cliente: ${clientName}
Nicho: ${niche}

Gere um Plano de Ação dividido nas seguintes partes:
1. Otimização da Ficha (3 dicas rápidas para este nicho)
2. Estratégia de Conteúdo (2 ideias de posts para o Google)
3. Captação de Avaliações (1 sugestão de como pedir avaliações)
4. Gatilho Comercial (Como o vendedor pode apresentar esse plano para fechar a venda de R$250/mês, oferecendo aumento de visibilidade em 30 dias)

Formate usando Markdown limpo com cabeçalhos e listas, seja direto e persuasivo.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        setPlan(response.text);
        if (response.usageMetadata?.totalTokenCount) {
          addTokensUsed(response.usageMetadata.totalTokenCount);
        }
      } else {
        throw new Error('Resposta vazia da IA.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao gerar o plano de ação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 pb-32 md:pb-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-white">Planos de Ação</h1>
        <p className="mt-2 text-xs md:text-sm text-slate-400">
          Crie estratégias personalizadas de GMN para seus leads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1 border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-lg font-bold text-white">Novo Plano</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Empresa</label>
              <input 
                type="text" 
                className="w-full rounded-md border border-white/20 bg-black/20 focus:bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="Ex: Restaurante do João"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nicho de Mercado</label>
              <input 
                type="text" 
                className="w-full rounded-md border border-white/20 bg-black/20 focus:bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="Ex: Restaurante, Oficina, Clínica"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <button 
              onClick={generatePlan}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:text-white/50"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Gerar Plano Estratégico</>
              )}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          {plan ? (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-sm min-h-[400px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <h2 className="font-heading text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <Target className="h-5 w-5 text-teal-400" />
                  Plano de Ação Sugerido
                </h2>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium font-sans transition-colors">Copiar Conteúdo</button>
              </div>
              <div className="prose prose-sm prose-invert prose-indigo max-w-none">
                <div className="markdown-body">
                  <Markdown>{plan}</Markdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center min-h-[400px] text-slate-400 p-8 text-center">
              <Sparkles className="h-12 w-12 text-slate-600 mb-4" />
              <p className="font-medium text-slate-300">Nenhum plano gerado ainda</p>
              <p className="text-sm mt-1 max-w-sm">
                Preencha os dados do cliente ao lado e utilize a inteligência artificial para criar uma estratégia de SEO local irresistível para oferecer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
