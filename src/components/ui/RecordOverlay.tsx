"use client";

import React from 'react';
import Image from 'next/image';
import { LightweightRelease } from './RecentGrid';
import { PriceSuggestions } from '@/lib/discogs';

export function RecordOverlay({ release, onClose }: { release: LightweightRelease, onClose: () => void }) {
  const [suggestions, setSuggestions] = React.useState<PriceSuggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);

  // Lock body scroll when overlay is open to prevent background scrolling
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // Fetch price suggestions in parallel
    if (release?.releaseId) {
      setLoadingSuggestions(true);
      fetch(`/api/discogs/price-suggestions/${release.releaseId}`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data);
          setLoadingSuggestions(false);
        })
        .catch(err => {
          console.error("Failed to fetch suggestions:", err);
          setLoadingSuggestions(false);
        });
    }

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [release?.releaseId]);

  if (!release) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-8 overflow-y-auto">
      {/* Animated Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl z-10 flex flex-col md:flex-row bg-surface-container-lowest rounded-sm overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 my-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-md"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Hero Section: Cover Art */}
        <div className="w-full md:w-1/2 relative flex flex-col items-center justify-center bg-[#090909]">
          <div className="w-full aspect-square relative group">
            {release.imageUrl ? (
              <Image 
                src={release.imageUrl} 
                alt={release.title} 
                className="object-cover object-center"
                fill
                sizes="(max-width: 768px) 100vw, 450px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-container">
                <span className="material-symbols-outlined text-outline text-8xl opacity-20 text-on-surface">album</span>
              </div>
            )}
            {/* Vinyl Shine Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none mix-blend-overlay"></div>
          </div>
        </div>

        {/* Content Section: Insights */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-surface-container-lowest">
          <div className="mb-8">
            <span className="font-headline font-bold uppercase text-[10px] tracking-[0.3em] text-primary mb-2 block">RECORD INSIGHTS</span>
            <h2 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter leading-none text-on-surface mb-2">
              {release.title}
            </h2>
            <p className="font-body italic text-2xl text-secondary">
              {release.artist}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-10">
            <div>
              <p className="font-headline font-bold uppercase text-[10px] text-on-surface-variant/60 tracking-widest mb-1">RELEASE YEAR</p>
              <p className="font-headline font-black text-xl text-on-surface">{release.year || 'Unknown'}</p>
            </div>
            <div>
              <p className="font-headline font-bold uppercase text-[10px] text-on-surface-variant/60 tracking-widest mb-1">LABEL</p>
              <p className="font-headline font-black text-lg text-on-surface truncate leading-tight">{release.label}</p>
              <p className="font-body italic text-xs text-on-surface-variant">{release.catno}</p>
            </div>
            <div className="col-span-2">
              <p className="font-headline font-bold uppercase text-[10px] text-on-surface-variant/60 tracking-widest mb-1">FORMAT</p>
              <p className="font-body italic text-sm text-on-surface leading-snug">{release.formats}</p>
            </div>
            <div>
              <p className="font-headline font-bold uppercase text-[10px] text-on-surface-variant/60 tracking-widest mb-1">ADDED TO CRATE</p>
              <p className="font-body italic text-sm text-on-surface">{formatDate(release.dateAdded)}</p>
            </div>
          </div>

          <div className="mb-10">
            <p className="font-headline font-bold uppercase text-[10px] text-on-surface-variant/60 tracking-widest mb-3">GENRES & STYLES</p>
            <div className="flex flex-wrap gap-2">
              {release.genres.map(g => (
                <span key={g} className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-headline font-bold text-[10px] uppercase tracking-widest rounded-full">
                  {g}
                </span>
              ))}
              {release.styles.slice(0, 4).map(s => (
                <span key={s} className="px-3 py-1 bg-surface-container-high text-on-surface-variant font-body italic text-[10px] rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-10 p-4 rounded-xl bg-surface-container-low/40 border border-white/5 backdrop-blur-sm">
            <p className="font-headline font-bold uppercase text-[10px] text-primary/60 tracking-widest mb-4">MARKET INSIGHTS (SUGGESTED)</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="font-headline font-bold text-[8px] text-on-surface-variant/40 tracking-widest uppercase mb-1">Mint (M)</span>
                {loadingSuggestions ? (
                  <div className="h-6 w-16 bg-white/5 animate-pulse rounded-sm" />
                ) : (
                  <span className="font-headline font-black text-xl text-primary">
                    {suggestions?.["Mint (M)"] ? `$${suggestions["Mint (M)"].value.toFixed(2)}` : 'N/A'}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-[8px] text-on-surface-variant/40 tracking-widest uppercase mb-1">Near Mint (NM)</span>
                {loadingSuggestions ? (
                  <div className="h-6 w-16 bg-white/5 animate-pulse rounded-sm" />
                ) : (
                  <span className="font-headline font-black text-xl text-secondary">
                    {suggestions?.["Near Mint (NM or M-)"] ? `$${suggestions["Near Mint (NM or M-)"].value.toFixed(2)}` : 'N/A'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-4">
            <a 
              href={`https://www.discogs.com/release/${release.releaseId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-8 py-4 bg-primary text-black font-headline font-black uppercase text-xs tracking-widest rounded-sm text-center hover:bg-primary/90 transition-all active:scale-[0.98] group flex items-center justify-center gap-2"
            >
              EXPLORE ON DISCOGS
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">open_in_new</span>
            </a>
            <button 
              onClick={onClose}
              className="px-8 py-4 border border-surface-container-highest text-on-surface-variant font-headline font-bold uppercase text-xs tracking-widest rounded-sm hover:bg-surface-container-high transition-all active:scale-[0.98]"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
