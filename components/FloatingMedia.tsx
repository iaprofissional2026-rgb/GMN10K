'use client';

import { useState, useEffect } from 'react';
import { Music, X, Minimize2, Maximize2, Play, AlertCircle, Maximize } from 'lucide-react';

export function FloatingMedia() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gmn_media_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.videoId) {
          setVideoId(parsed.videoId);
          setUrl(parsed.url || '');
          setIsOpen(true);
          setIsMinimized(true);
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
      localStorage.setItem('gmn_media_state', JSON.stringify({ url, videoId: id }));
      
      if (!hasRequestedPermission && 'Notification' in window) {
        Notification.requestPermission().then((permission) => {
          setHasRequestedPermission(true);
          if (permission === 'granted') {
            console.log('Permissão concedida');
          }
        });
      }
    } else {
      alert('Link do YouTube inválido. Ex: https://youtube.com/watch?v=...');
    }
  };

  const closePlayer = () => {
    setIsOpen(false);
    setVideoId('');
    setUrl('');
    localStorage.removeItem('gmn_media_state');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center justify-center h-12 w-12 rounded-full bg-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 hover:scale-105 transition-all"
        title="Ouvir Foco"
      >
        <Music className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isMinimized 
          ? 'bottom-20 md:bottom-6 right-4 md:right-6 w-64'
          : 'bottom-20 md:bottom-6 right-4 md:right-6 w-[85vw] md:w-80 shadow-2xl'
      }`}
    >
      <div className="bg-[#0A0F14]/95 backdrop-blur-xl border border-emerald-500/20 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-emerald-500/10">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-50">Media Player</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </button>
            <button 
              onClick={closePlayer} 
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-3">
            {!videoId ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 text-center">
                  Link do YouTube para tocar de fundo (Ex: Lo-Fi, Podcast, etc).
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Link do YouTube..."
                    className="flex-1 bg-black/40 border border-emerald-500/20 rounded-md px-2.5 py-1.5 text-sm text-emerald-50 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleApply}
                    className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 p-1.5 rounded-md transition-colors border border-emerald-500/30 flex items-center justify-center shrink-0"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                </div>
                {!hasRequestedPermission && (
                  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-md p-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-200/80 leading-tight">
                      Para tocar enquanto usa outros apps, permita as notificações sobrepor, ou use o recurso PiP nativo.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="aspect-video w-full rounded-md overflow-hidden bg-black relative group">
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
                <div className="flex gap-2 justify-between mt-1 items-center">
                  <button 
                    onClick={() => setVideoId('')}
                    className="text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors"
                  >
                    Mudar Vídeo
                  </button>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Maximize className="h-3 w-3" /> Use PiP do player
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
