'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Brain, Target, MessageSquare, Search, Bot } from 'lucide-react';

const navigation = [
  { name: 'Dash', href: '/', icon: LayoutDashboard },
  { name: 'IA', href: '/assistant', icon: Bot },
  { name: 'Base', href: '/knowledge', icon: Brain },
  { name: 'Planos', href: '/actions', icon: Target },
  { name: 'Leads', href: '/prospecting', icon: MessageSquare },
  { name: 'Concor.', href: '/competitors', icon: Search },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] grid grid-cols-6 h-18 items-center border-t border-white/10 bg-slate-950/90 backdrop-blur-xl pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.3)]">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 relative ${
              isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-500 rounded-b-full shadow-[0_2px_10px_rgba(99,102,241,0.5)]" />
            )}
            <item.icon className={`h-6 w-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
            <span className={`text-[9px] font-bold mt-1 uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
