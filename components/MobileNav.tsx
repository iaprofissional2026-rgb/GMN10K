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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 grid grid-cols-6 h-16 items-center border-t border-white/10 bg-slate-950/80 backdrop-blur-md pb-safe">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
