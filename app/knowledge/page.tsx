'use client';

import { useFiles } from '@/app/context/FileContext';
import { Database, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeBase() {
  const { files, removeFile } = useFiles();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/assistant" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Assistente
        </Link>
        
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Base de <span className="text-emerald-400">Conhecimento</span></h1>
            <p className="text-slate-400">Arquivos que orientam a inteligência do seu assistente.</p>
          </div>
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <span className="text-3xl font-bold text-emerald-400">{files.length}</span>
            <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mt-1">Arquivos Ativos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map(file => (
            <div key={file.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <Database className="h-8 w-8 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                <button onClick={() => removeFile(file.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-bold text-lg mb-1 truncate">{file.name}</h3>
              <p className="text-xs text-slate-500 uppercase tracking-tighter mb-4">{file.type} &middot; {file.status}</p>
              <div className="text-xs text-slate-400 line-clamp-3 bg-black/30 p-3 rounded-lg border border-white/5 italic">
                {file.content}
              </div>
            </div>
          ))}
          
          <Link href="/knowledge/upload" className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-slate-500 hover:text-emerald-400">
            <Plus className="h-8 w-8" />
            <span className="font-bold text-sm">Adicionar Arquivos</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
