"use client";

import { useEffect } from 'react';

interface AboutSheetProps {
  onClose: () => void;
}

export function AboutSheet({ onClose }: AboutSheetProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md mx-auto bg-[#1A1A1A]/95 backdrop-blur-xl rounded-t-2xl sm:rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">

        {/* Vinyl ring decoration */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full border border-white/[0.03] pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full border border-white/[0.03] pointer-events-none" />
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border border-white/[0.03] pointer-events-none" />

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pt-4 pb-8 sm:pt-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-headline font-black text-lg uppercase tracking-tight text-[#E5E2E1]">About Vinyl Pulse</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#E5E2E1]/40 mt-0.5">A personal project</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#E5E2E1]/60 hover:text-[#E5E2E1] active:scale-90"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* Made by */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.04]">
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-base">person</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E5E2E1]/40 mb-0.5">Made by</p>
                <a
                  href="https://www.linkedin.com/in/bavobruylandt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Bavo Bruylandt ↗
                </a>
              </div>
            </div>

            {/* GitHub */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.04]">
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#E5E2E1]/60 text-base">code</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E5E2E1]/40 mb-0.5">Open source</p>
                <a
                  href="https://github.com/bavobbr/discogs-insights"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[#E5E2E1] hover:text-primary transition-colors"
                >
                  github.com/bavobbr/discogs-insights ↗
                </a>
              </div>
            </div>

            {/* Discogs disclaimer */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.04]">
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#E5E2E1]/60 text-base">info</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E5E2E1]/40 mb-1">Disclaimer</p>
                <p className="text-xs text-[#E5E2E1]/60 leading-relaxed">
                  Vinyl Pulse uses the{' '}
                  <a
                    href="https://www.discogs.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E5E2E1]/80 hover:text-primary transition-colors underline underline-offset-2"
                  >
                    Discogs
                  </a>{' '}
                  API to retrieve your collection data. This is an independent third-party application and is not affiliated with, endorsed by, or in any way officially connected to Discogs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
