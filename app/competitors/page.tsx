'use client';

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Search, Loader2, Sparkles, Building2, TrendingUp, AlertCircle, Copy } from 'lucide-react';
import Markdown from 'react-markdown';
import { BackButton } from '@/components/BackButton';
import { useSettings } from '@/app/context/SettingsContext';

export default function Competitors() {
  const { apiKey, addTokensUsed } = useSettings();
  const [competitors, setCompetitors] = useState('');
  const [myBusiness, setMyBusiness] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');

  const generateAnalysis = async () => {
    if (!competitors || !myBusiness) {
      setError('Por favor, preencha os dados do seu negócio e dos concorrentes.');
      return;
    }
    
    setError('');
    setLoading(true);
    setAnalysis('');

    try {
      const activeApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!activeApiKey) {
        throw new Error('Chave da API do Gemini não configurada.');
      }

      const ai = new GoogleGenAI({ apiKey: activeApiKey });
      
      const prompt = `Você é um estrategista de SEO Local focado em Google Meu Negócio.
Vou fornecer os dados ou nomes dos meus principais concorrentes e do meu próprio negócio.

Meu Negócio: ${myBusiness}
Meus Concorrentes: ${competitors}

Com base no seu conhecimento de mercado para este nicho, gere uma Análise de Concorrentes profunda e acionável:
1. Pontos Fortes e Fracos (Gerais do nicho ou específicos caso você os conheça)
2. Estratégia de Conteúdo Observada (O que costuma funcionar para eles)
3. Estratégia de Avaliações (Como eles provavelmente captam e como podemos superá-los)
4. Plano de Ação (3 passos práticos para o MEU negócio roubar clientes deles a partir da ficha do GMN)

Formate a resposta em Markdown usando títulos (##), listas e negritos (sem tags XML). Seja prático e direto.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        setAnalysis(response.text);
        if (response.usageMetadata?.totalTokenCount) {
          addTokensUsed(response.usageMetadata.totalTokenCount);
        }
      } else {
        throw new Error('Resposta vazia da IA.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao gerar a análise.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Análise de Concorrentes</h1>
        <p className="mt-1 text-sm text-slate-400">
          Descubra o que seus vizinhos estão fazendo de melhor no Google e ultrapasse todos eles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Painel de Configuração */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-xl p-5 md:p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-indigo-400" />
              Perfis a Analisar
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Meu Negócio (Nome e Nicho)</label>
                <input 
                  type="text" 
                  className="w-full rounded-md border border-white/20 bg-black/20 focus:bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Ex: Padaria do Zé (Padarias)"
                  value={myBusiness}
                  onChange={(e) => setMyBusiness(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Concorrentes (Nomes ou URLs)</label>
                <textarea 
                  className="w-full rounded-md border border-white/20 bg-black/20 focus:bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors min-h-[100px] resize-y"
                  placeholder="Ex: Padaria Pão de Ouro, Padaria Trigo Bom"
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                />
              </div>
              
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <button 
                onClick={generateAnalysis}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:text-white/50"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analisando Dados...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Gerar Análise</>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 backdrop-blur-sm">
            <h3 className="text-indigo-300 font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insight Rápido
            </h3>
            <p className="text-sm text-indigo-100/80">
              Negócios que respondem às avaliações mais rápido que a concorrência costumam subir até 3 posições no ranking do Google Maps local.
            </p>
          </div>
        </div>

        {/* Área de Resultado */}
        <div className="lg:col-span-8 flex flex-col h-full">
          {analysis ? (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm flex flex-col h-full overflow-hidden">
              <div className="bg-white/5 px-5 py-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-heading font-semibold text-slate-100 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-teal-400" />
                  Relatório de Inteligência
                </h3>
                <button 
                  onClick={copyText}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden md:inline">Copiar</span>
                </button>
              </div>
              <div className="p-5 md:p-8 flex-1 overflow-y-auto">
                <div className="prose prose-sm prose-invert prose-indigo max-w-none">
                  <div className="markdown-body">
                    <Markdown>{analysis}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center min-h-[400px] text-slate-400 p-8 h-full backdrop-blur-sm">
              <Search className="h-16 w-16 text-slate-600 mb-4" />
              <p className="font-medium text-slate-300 text-center">Aguardando Concorrentes</p>
              <p className="text-sm mt-2 max-w-sm text-center">
                Insira o nome do seu negócio e dos seus concorrentes para a IA cruzar os dados com as melhores práticas de SEO Local.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
