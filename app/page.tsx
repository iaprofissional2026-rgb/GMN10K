'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ArrowUpRight, Users, Eye, Star, TrendingUp, Settings2, Check, X } from 'lucide-react';

const mockViewsData = [
  { name: 'Jan', views: 4000 },
  { name: 'Fev', views: 3000 },
  { name: 'Mar', views: 5000 },
  { name: 'Abr', views: 8000 },
  { name: 'Mai', views: 12000 },
  { name: 'Jun', views: 16000 },
];

const mockConversionData = [
  { name: 'Sem 1', conversao: 12 },
  { name: 'Sem 2', conversao: 15 },
  { name: 'Sem 3', conversao: 18 },
  { name: 'Sem 4', conversao: 25 },
];

export default function Dashboard() {
  const [closedClients, setClosedClients] = useState(0);
  const [goal, setGoal] = useState(20);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempClosed, setTempClosed] = useState(0);
  const [tempGoal, setTempGoal] = useState(20);
  const userEmail = 'souturbo149@gmail.com';

  useEffect(() => {
    const loadGoals = async () => {
      // Local fallback
      const savedData = localStorage.getItem('gmn_goals');
      if (savedData) {
        try {
          const { closed, meta } = JSON.parse(savedData);
          setClosedClients(closed || 0);
          setGoal(meta || 20);
          setTempClosed(closed || 0);
          setTempGoal(meta || 20);
        } catch (e) {}
      }

      // Supabase sync (filtered by user email)
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_email', userEmail)
          .maybeSingle();
        
        if (!error && data) {
          setClosedClients(data.closed || 0);
          setGoal(data.meta || 20);
          setTempClosed(data.closed || 0);
          setTempGoal(data.meta || 20);
          localStorage.setItem('gmn_goals', JSON.stringify({ closed: data.closed, meta: data.meta }));
        }
      } catch (err) {
        console.warn('Supabase goals sync warning');
      }
    };
    loadGoals();
  }, [userEmail]);

  const saveGoals = async () => {
    setClosedClients(tempClosed);
    setGoal(tempGoal);
    localStorage.setItem('gmn_goals', JSON.stringify({ closed: tempClosed, meta: tempGoal }));
    
    try {
      await supabase
        .from('goals')
        .upsert({ 
          id: `${userEmail}_goals`, 
          closed: tempClosed, 
          meta: tempGoal,
          user_email: userEmail
        }, { onConflict: 'user_email' });
    } catch (err) {
      console.error('Error saving goals to Supabase:', err);
    }
    
    setIsEditingGoal(false);
  };

  const cancelGoals = () => {
    setTempClosed(closedClients);
    setTempGoal(goal);
    setIsEditingGoal(false);
  };

  return (
    <div className="p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 md:mb-0">Dashboard</h1>
          <p className="text-xs md:text-sm text-slate-400">Métricas de otimização Google Meu Negócio.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            className="flex-1 md:flex-none flex items-center justify-center rounded-lg bg-slate-900 border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            <Settings2 className="h-3.5 w-3.5 mr-2" />
            Meta
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">
            Relatórios
          </button>
        </div>
      </div>

      {isEditingGoal && (
        <div className="mb-8 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <h3 className="text-sm font-semibold text-indigo-400 mb-4">Ajustar Indicadores</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-5">
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Clientes Fechados</label>
              <input
                type="number"
                min="0"
                value={tempClosed}
                onChange={(e) => setTempClosed(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border-0 bg-black/40 px-4 py-3 text-sm text-slate-100 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Meta Mensal</label>
              <input
                type="number"
                min="1"
                value={tempGoal}
                onChange={(e) => setTempGoal(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border-0 bg-black/40 px-4 py-3 text-sm text-slate-100 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={saveGoals}
                className="flex-1 h-11 flex items-center justify-center rounded-lg bg-teal-500 px-6 text-sm font-bold text-slate-950 transition hover:bg-teal-400 active:scale-95"
              >
                <Check className="h-4 w-4 mr-2" /> Salvar
              </button>
              <button 
                onClick={cancelGoals}
                className="w-11 h-11 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition hover:bg-slate-700 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { title: 'Fechamentos', value: `${closedClients}/${goal}`, change: closedClients > 0 ? `+${closedClients}` : '0', icon: Users, isGoal: true },
          { title: 'Visualizações', value: '16.4K', change: '+34%', icon: Eye },
          { title: 'Avaliações', value: '210', change: '+12%', icon: Star },
          { title: 'Conversão', value: '25%', change: '+5%', icon: TrendingUp },
        ].map((stat, i) => {
          const progress = stat.isGoal ? Math.min(100, (closedClients / goal) * 100) : null;
          return (
            <div key={i} className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-4 md:p-6 shadow-sm relative overflow-hidden group hover:bg-slate-900/60 transition-all duration-300">
              {stat.isGoal && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
                  style={{ width: `${progress}%` }}
                />
              )}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 md:mb-5">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">{stat.title}</span>
                  <div className={`p-1.5 md:p-2 rounded-lg bg-white/5 ${stat.isGoal && progress && progress >= 100 ? 'text-teal-400' : 'text-slate-400'}`}>
                    <stat.icon className="h-3.5 w-3.5 md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-xl md:text-3xl font-bold tracking-tight ${stat.isGoal && progress && progress >= 100 ? 'text-teal-400' : 'text-white'}`}>{stat.value}</span>
                  <span className="flex items-center text-[10px] md:text-xs font-bold text-teal-400 mt-1">
                    <ArrowUpRight className="mr-0.5 h-2.5 w-2.5" />
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {/* Views Chart */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-5 md:p-8 shadow-sm lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-base md:text-xl font-bold text-white">Visualizações do Perfil</h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">MAPS</span>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockViewsData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <Tooltip
                  cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Chart */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-5 md:p-8 shadow-sm">
          <h2 className="mb-8 font-heading text-base md:text-xl font-bold text-white text-center sm:text-left">Conversão (%)</h2>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockConversionData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}
                />
                <Bar dataKey="conversao" fill="#2dd4bf" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
