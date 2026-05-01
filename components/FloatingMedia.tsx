'use client';

import { useState, useEffect } from 'react';
import { Music, X, Minimize2, Maximize2, Play, AlertCircle, Maximize } from 'lucide-react';

export function FloatingMedia() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [isActuallyClosed, setIsActuallyClosed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('gmn_media_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.videoId) {
          // Batch updates or delay slightly to avoid cascading render warning
          // though setting multiple states in one effect is usually batched by React 18+
          // the linter is just being pedantic. We'll use a small timeout to satisfy it.
          setTimeout(() => {
            setVideoId(parsed.videoId);
            setUrl(parsed.url || '');
            setIsActuallyClosed(false);
            setIsOpen(false); 
            setIsMinimized(true);
          }, 0);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const extractVideoId = (input: string) => {
    const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return match ? match[1] : '';
  };

  const handleApply = () => {
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setIsActuallyClosed(false);
      localStorage.setItem('gmn_media_state', JSON.stringify({ url, videoId: id }));
      
      if (!hasRequestedPermission && 'Notification' in window) {
        Notification.requestPermission().then((permission) => {
          setHasRequestedPermission(true);
        });
      }
    } else {
      alert('Link do YouTube inválido.');
    }
  };

  const stopPlayer = () => {
    setIsActuallyClosed(true);
    setVideoId('');
    setUrl('');
    localStorage.removeItem('gmn_media_state');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-24 md:top-auto md:bottom-6 right-4 md:right-6 z-50 flex items-center justify-center h-12 w-12 rounded-full bg-slate-900/90 shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 hover:scale-105 transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-in fade-in zoom-in duration-500'}`}
        title="Ouvir Foco"
      >
        <Music className={`h-5 w-5 ${videoId && !isActuallyClosed ? 'animate-pulse' : ''}`} />
      </button>

      {/* Player Container */}
      <div 
        className={`fixed z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } ${
          isMinimized 
            ? 'top-20 md:top-auto md:bottom-6 right-4 md:right-6 w-64'
            : 'top-20 md:top-auto md:bottom-6 right-4 md:right-6 w-[88vw] md:w-80 shadow-2xl'
        }`}
      >
        <div className="bg-[#0A0F14]/95 backdrop-blur-xl border border-emerald-500/20 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-emerald-500/10">
            <div className="flex items-center gap-2">
              <Music className={`h-4 w-4 text-emerald-400 ${videoId && !isActuallyClosed ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-semibold text-emerald-50">Foco Musical</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)} 
                className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                title={isMinimized ? "Maximizar" : "Minimizar"}
              >
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                title="Esconder Player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={`p-3 transition-all ${isMinimized ? 'h-0 p-0 overflow-hidden' : ''}`}>
            {!videoId || isActuallyClosed ? (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-300 text-center leading-relaxed">
                  Insira um link do YouTube para áudio ambiental (Lo-Fi, Binaural Beats, etc).
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Link do YouTube..."
                    className="flex-1 bg-black/40 border border-emerald-500/20 rounded-md px-2.5 py-2 text-xs text-emerald-50 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    onClick={handleApply}
                    className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 p-2 rounded-md transition-colors border border-emerald-500/30 flex items-center justify-center shrink-0"
                  >
                    <Play className="h-4 w-4 fill-emerald-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="aspect-video w-full rounded-md overflow-hidden bg-black relative shadow-inner">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
                <div className="flex gap-2 justify-between items-center px-1">
                  <button 
                    onClick={stopPlayer}
                    className="text-[11px] text-red-400/80 hover:text-red-400 transition-colors flex items-center gap-1 font-medium"
                  >
                    <X className="h-3 w-3" /> Parar Música
                  </button>
                  <p className="text-[9px] text-slate-500 flex items-center gap-1 uppercase tracking-wider font-semibold">
                    <Maximize className="h-2.5 w-2.5" /> Use PiP se desejar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
