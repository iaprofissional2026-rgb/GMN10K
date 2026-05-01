'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/') {
    return null; // Don't show on home page
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => router.back()}
        className="flex items-center justify-center p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-colors text-slate-300 hover:text-white group"
        title="Voltar para tela anterior"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <Link
        href="/"
        className="flex items-center justify-center p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-colors text-slate-300 hover:text-white"
        title="Ir para o Início"
      >
        <Home className="h-4 w-4" />
      </Link>
    </div>
  );
}
