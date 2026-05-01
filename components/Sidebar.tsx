'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Brain, Target, MessageSquare, Briefcase, Search, Bot } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assistente IA', href: '/assistant', icon: Bot },
  { name: 'Base de Conhecimento', href: '/knowledge', icon: Brain },
  { name: 'Planos de Ação', href: '/actions', icon: Target },
  { name: 'Prospecção', href: '/prospecting', icon: MessageSquare },
  { name: 'Concorrentes', href: '/competitors', icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r border-white/10 bg-white/5 backdrop-blur-md">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Briefcase className="h-6 w-6 text-indigo-400" />
        <span className="ml-3 font-sans font-bold text-slate-100">GMN Assist</span>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 backdrop-blur-md p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 rounded-full bg-teal-500/20 opacity-30 blur-xl"></div>
          <p className="text-xs font-semibold text-teal-400 mb-1">Meta Mensal</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-100">8/20</span>
            <span className="text-xs text-slate-400 mb-1">Clientes</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
            <div className="h-1.5 rounded-full bg-teal-400" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
