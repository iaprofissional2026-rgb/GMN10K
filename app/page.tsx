'use client';

import { useState, useEffect } from 'react';
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

const mockReviewsData = [
  { name: 'Jan', reviews: 20 },
  { name: 'Fev', reviews: 45 },
  { name: 'Mar', reviews: 80 },
  { name: 'Abr', reviews: 100 },
  { name: 'Mai', reviews: 140 },
  { name: 'Jun', reviews: 210 },
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

  useEffect(() => {
    const savedData = localStorage.getItem('gmn_goals');
    if (savedData) {
      try {
        const { closed, meta } = JSON.parse(savedData);
        setClosedClients(closed || 0);
        setGoal(meta || 20);
        setTempClosed(closed || 0);
        setTempGoal(meta || 20);
      } catch (e) {
        console.error('Error parsing goals', e);
      }
    }
  }, []);

  const saveGoals = () => {
    setClosedClients(tempClosed);
    setGoal(tempGoal);
    localStorage.setItem('gmn_goals', JSON.stringify({ closed: tempClosed, meta: tempGoal }));
    setIsEditingGoal(false);
  };

  const cancelGoals = () => {
    setTempClosed(closedClients);
    setTempGoal(goal);
    setIsEditingGoal(false);
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-100">Dashboard de Resultados</h1>
          <p className="mt-1 text-sm text-slate-400">Acompanhe as métricas de suas campanhas e perfis otimizados.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            className="flex items-center rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Configurar Meta
          </button>
          <button className="flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600">
            Gerar Relatório
          </button>
        </div>
      </div>

      {isEditingGoal && (
        <div className="mb-8 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-indigo-300 mb-1">Empresas Fechadas</label>
              <input
                type="number"
                min="0"
                value={tempClosed}
                onChange={(e) => setTempClosed(parseInt(e.target.value) || 0)}
                className="w-full rounded-md border-0 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-indigo-300 mb-1">Meta Mensal</label>
              <input
                type="number"
                min="1"
                value={tempGoal}
                onChange={(e) => setTempGoal(parseInt(e.target.value) || 1)}
                className="w-full rounded-md border-0 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={saveGoals}
                className="flex-1 sm:flex-none flex items-center justify-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-400"
              >
                <Check className="h-4 w-4 mr-1" /> Salvar
              </button>
              <button 
                onClick={cancelGoals}
                className="flex-1 sm:flex-none flex items-center justify-center rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <X className="h-4 w-4 mr-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Clientes Fechados (Mês)', value: `${closedClients}/${goal}`, change: closedClients > 0 ? `+${closedClients}` : '0', icon: Users, isGoal: true },
          { title: 'Views Maps (Mensal)', value: '16.4K', change: '+34%', icon: Eye },
          { title: 'Novas Avaliações', value: '210', change: '+12%', icon: Star },
          { title: 'Taxa de Conversão', value: '25%', change: '+5%', icon: TrendingUp },
        ].map((stat, i) => {
          const progress = stat.isGoal ? Math.min(100, (closedClients / goal) * 100) : null;
          return (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-sm relative overflow-hidden group">
              {stat.isGoal && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-teal-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              )}
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">{stat.title}</span>
                  <stat.icon className={`h-5 w-5 ${stat.isGoal && progress && progress >= 100 ? 'text-teal-400' : 'text-slate-400'}`} />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className={`text-3xl font-bold tracking-tight ${stat.isGoal && progress && progress >= 100 ? 'text-teal-400' : 'text-slate-100'}`}>{stat.value}</span>
                  <span className="flex items-center text-sm font-medium text-teal-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Views Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-6 font-heading text-lg font-semibold text-slate-100">Crescimento de Visualizações (Maps)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockViewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="views" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-sm">
          <h2 className="mb-6 font-heading text-lg font-semibold text-slate-100">Taxa de Conversão de Leads (%)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockConversionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                />
                <Bar dataKey="conversao" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reviews Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-sm lg:col-span-3">
          <h2 className="mb-6 font-heading text-lg font-semibold text-slate-100">Crescimento de Avaliações Positivas</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockReviewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="reviews" stroke="#fcd34d" strokeWidth={3} dot={{ strokeWidth: 2, r: 4, fill: '#1e293b' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
