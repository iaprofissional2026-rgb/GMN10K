import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30">
          <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400">Carregando...</p>
      </div>
    </div>
  );
}
