"use client";

import React, { useState } from 'react';
import { GenreStyleData } from '@/lib/discogs';
import { CrateDiggingOverlay } from '@/components/ui/CrateDiggingOverlay';

interface ExtendedGenreData extends GenreStyleData {
  percentage: number;
  strokeDashInner: string;
  strokeDashOuter: string;
  offsetInner: number;
  offsetOuter: number;
}

export function GenreStyleMatrix({ data }: { data: GenreStyleData[] }) {
  const [selectedGenre, setSelectedGenre] = useState<ExtendedGenreData | null>(null);
  const [hoveredGenre, setHoveredGenre] = useState<ExtendedGenreData | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<{name: string, count: number, releases: DiscogsRelease[]} | null>(null);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const R_INNER = 40;
  const R_OUTER = 47.5;
  const CIRC_INNER = 2 * Math.PI * R_INNER;
  const CIRC_OUTER = 2 * Math.PI * R_OUTER;

  let currentOffsetInner = 0;
  let currentOffsetOuter = 0;
  const segments = data.map((item) => {
    const percentage = item.count / total;
    
    const dashLengthInner = percentage * CIRC_INNER;
    const dashLengthOuter = percentage * CIRC_OUTER;
    
    const strokeDashInner = `${dashLengthInner} ${CIRC_INNER}`;
    const strokeDashOuter = `${dashLengthOuter} ${CIRC_OUTER}`;
    
    const offsetInner = -currentOffsetInner;
    const offsetOuter = -currentOffsetOuter;
    
    currentOffsetInner += dashLengthInner;
    currentOffsetOuter += dashLengthOuter;

    return { 
      ...item, 
      percentage, 
      strokeDashInner, 
      strokeDashOuter,
      offsetInner,
      offsetOuter
    };
  });

  if (selectedGenre) {
    // ... Style View (unchanged logic)
    return (
      <div className="flex flex-col items-center py-8 transition-all duration-500 ease-in-out opacity-100">
        <div className="w-full max-w-md">
          <button 
            onClick={() => setSelectedGenre(null)}
            className="flex items-center gap-2 mb-6 text-[#E5E2E1]/50 hover:text-[#FF4F00] transition-colors group"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="font-label font-bold uppercase text-[10px] tracking-widest">BACK TO GENRES</span>
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-3 h-12 rounded-full" style={{ backgroundColor: selectedGenre.color }}></div>
            <div>
              <h2 className="font-headline font-black text-4xl uppercase tracking-tighter leading-none">{selectedGenre.name}</h2>
              <p className="font-body text-[10px] uppercase font-bold tracking-widest text-[#FF4F00]/70 mt-1">{selectedGenre.count} releases in this zone</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selectedGenre.styles.map((style, i) => {
              const isClickable = style.releases && style.releases.length > 0;
              return (
                <div 
                  key={style.name}
                  onClick={isClickable ? () => setSelectedStyle(style) : undefined}
                  className={`relative overflow-hidden bg-surface-container-low p-5 rounded-2xl border border-white/5 transition-all duration-300 group ${isClickable ? 'cursor-pointer hover:border-[#FF4F00]/30 active:scale-95' : ''}`}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent -mr-8 -mt-8 rounded-full"></div>
                  
                  <span className="relative z-10 font-label font-black text-[8px] text-[#FF4F00]/50 block mb-1 tracking-[0.2em]">{i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
                  <span className={`relative z-10 font-headline font-black text-lg text-[#E5E2E1] transition-colors leading-tight line-clamp-1 ${isClickable ? 'group-hover:text-primary' : ''}`}>{style.name}</span>
                  
                  <div className="relative z-10 mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-on-surface-variant italic font-body">{style.count} items</span>
                    <div className="h-0.5 bg-surface-container-high rounded-full w-10 overflow-hidden">
                      <div 
                         className="h-full bg-[#FF4F00] transition-all duration-1000 delay-300" 
                         style={{ width: `${(style.count / selectedGenre.count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Style Crate Digging Overlay */}
        {selectedStyle && (
          <CrateDiggingOverlay
            subtitle={`${selectedStyle.name} CATALOG`}
            releases={selectedStyle.releases}
            onClose={() => setSelectedStyle(null)}
          />
        )}
      </div>
    );
  }

  const handleGenreClick = (seg: ExtendedGenreData) => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      if (hoveredGenre?.name === seg.name) {
        // Second tap: Navigate
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20);
        }
        setSelectedGenre(seg);
      } else {
        // First tap: Focus
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
        setHoveredGenre(seg);
      }
    } else {
      setSelectedGenre(seg);
    }
  };

  return (
    <div className="relative flex flex-col items-center py-4 lg:py-8 animate-in fade-in duration-700 w-full overflow-visible">
      
      {/* Target Focus Label (Top Center) */}
      <div className="h-28 lg:h-32 flex flex-col items-center justify-center mb-8 lg:mb-12 transition-all duration-500 overflow-visible text-center max-w-sm px-4">
        {hoveredGenre ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center">
            <span className="font-headline font-black text-3xl lg:text-4xl uppercase tracking-tighter leading-none text-[#E5E2E1] mb-1">
              {hoveredGenre.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-label font-bold text-[9px] lg:text-[10px] text-[#FF4F00] uppercase tracking-[0.2em]">
                {Math.round(hoveredGenre.percentage * 100)}% COLLECTION
              </span>
              <div className="w-1 h-1 rounded-full bg-white/20"></div>
              <span className="font-label font-bold text-[9px] lg:text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
                {hoveredGenre.count} RELEASES
              </span>
            </div>
          </div>
        ) : (
          <div className="opacity-40 flex flex-col items-center mt-2">
             <span className="font-label font-black text-[9px] lg:text-[10px] uppercase tracking-[0.4em] text-[#FF4F00] animate-pulse">SELECT GENRE</span>
             <p className="font-body text-[10px] lg:text-xs italic text-on-surface-variant mt-3 px-6 leading-relaxed">Pick a genre to explore its subgenres and releases.</p>
          </div>
        )}
      </div>

      {/* Main Record Container with Responsive Scaling */}
      <div className="relative flex justify-center items-center scale-[0.8] sm:scale-90 lg:scale-100 transition-transform duration-500 mt-6 lg:mt-8 mb-4">
        {/* Background Circular Tonal Layering */}
        <div className="absolute w-[380px] h-[380px] rounded-full bg-surface-container-lowest shadow-[0_0_100px_rgba(0,0,0,0.95)] opacity-40"></div>
        
        {/* Vinyl Record Body with Focus Rings */}
        <div className="relative w-[300px] h-[300px] rounded-full bg-[#0E0E0E] flex items-center justify-center vinyl-grooves border border-white/10 shadow-2xl z-10 transition-shadow duration-700 scale-[1.02]">
          
          <svg className="w-[140%] h-[140%] absolute inset-[-20%] transform -rotate-90 origin-center pointer-events-none z-40 overflow-visible" viewBox="0 0 100 100">
            {/* Outer Focus Glow Ring (Electricity) */}
            {segments.map((seg) => {
              const isHovered = hoveredGenre?.name === seg.name;
              return (
                <g key={`glow-${seg.name}`}>
                  {/* Decorative Base Ring */}
                  <circle 
                    cx="50" cy="50" r={R_OUTER}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="0.5"
                    strokeDasharray={seg.strokeDashOuter}
                    strokeDashoffset={seg.offsetOuter}
                    className="opacity-10 transition-opacity duration-500"
                  />
                  {/* Electrified Glow Layer */}
                  <circle 
                    cx="50" cy="50" r={R_OUTER}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? "4" : "0"}
                    strokeDasharray={seg.strokeDashOuter}
                    strokeDashoffset={seg.offsetOuter}
                    className="transition-all duration-500 ease-out opacity-0 hover:opacity-100"
                    style={{ 
                      opacity: isHovered ? 0.8 : 0,
                      filter: 'blur(3px)'
                    }}
                  />
                  {/* Core Sharp Highlight */}
                  <circle 
                    cx="50" cy="50" r={R_OUTER}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? "1.5" : "0"}
                    strokeDasharray={seg.strokeDashOuter}
                    strokeDashoffset={seg.offsetOuter}
                    className="transition-all duration-300 ease-out"
                    style={{ opacity: isHovered ? 1 : 0 }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Inner Record Segments (Dimmable) */}
          <svg className="w-full h-full transform -rotate-90 origin-center relative z-20" viewBox="0 0 100 100">
            {segments.map((seg) => {
              const isHovered = hoveredGenre?.name === seg.name;
              const isAnyHovered = !!hoveredGenre;
              
              return (
                <circle 
                  key={seg.name}
                  cx="50" cy="50" fill="transparent"
                  r={R_INNER} 
                  stroke={seg.color}
                  strokeDasharray={seg.strokeDashInner}
                  strokeDashoffset={seg.offsetInner}
                  strokeWidth="20"
                  className="transition-all duration-500 ease-out cursor-pointer"
                  style={{ 
                    opacity: isAnyHovered ? (isHovered ? 1 : 0.25) : 1,
                    stroke: isHovered ? '#FFFFFF' : seg.color, // Flash white on focus
                    filter: isHovered ? 'brightness(1.5)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredGenre(seg)}
                  onMouseLeave={() => setHoveredGenre(null)}
                  onClick={() => handleGenreClick(seg)}
                />
              );
            })}
          </svg>

          {/* Inner Center Label (Spindle) */}
          <div className="absolute w-[100px] h-[100px] rounded-full bg-[#E5E2E1] flex flex-col items-center justify-center shadow-inner border-4 border-[#0E0E0E] overflow-hidden z-30">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
            <div className={`relative flex flex-col items-center justify-center text-[#0E0E0E] transition-all duration-500 ${hoveredGenre ? 'scale-110' : ''}`}>
              <span className="font-label font-black text-2xl leading-none mb-0.5">{total}</span>
              <span className="font-label font-bold uppercase text-[8px] tracking-tighter">RECORDS</span>
              {hoveredGenre && (
                <div className="absolute inset-[-4px] rounded-full border-2 border-primary/20 animate-ping"></div>
              )}
            </div>
            <div className="relative mt-2 w-2 h-2 rounded-full bg-[#0E0E0E] ring-4 ring-[#0E0E0E]/10"></div>
          </div>
        </div>
      </div>

      {/* Legend Overlay - Responsive Layout */}
      <div className="relative lg:absolute mt-8 lg:mt-0 lg:-bottom-10 lg:-right-8 bg-[#1A1A1A]/80 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl z-40 w-[90%] lg:w-auto">
        <div className="flex flex-col gap-2.5">
          <div className="mb-1">
            <span className="font-label font-black uppercase text-[8px] tracking-[0.3em] text-[#FF4F00]">CORE COLLECTION</span>
            <div className="h-px w-8 bg-[#FF4F00]/30 mt-1"></div>
          </div>
          <div className="grid grid-cols-2 lg:flex lg:flex-col gap-x-4 gap-y-2.5">
            {segments.map((seg) => (
              <div 
                key={seg.name} 
                className={`flex items-start lg:items-center gap-3 cursor-pointer group transition-all duration-300 ${hoveredGenre?.name === seg.name ? 'translate-x-2' : ''}`}
                onMouseEnter={() => setHoveredGenre(seg)}
                onMouseLeave={() => setHoveredGenre(null)}
                onClick={() => handleGenreClick(seg)}
              >
                <div className="w-1.5 h-1.5 rounded-full ring-4 ring-white/5 flex-shrink-0 mt-1 lg:mt-0" style={{ backgroundColor: seg.color }}></div>
                <span className={`font-label font-bold uppercase text-[9px] lg:text-[10px] transition-colors leading-tight ${hoveredGenre?.name === seg.name ? 'text-[#FF4F00]' : 'text-on-surface'}`}>
                  {seg.name} <span className="text-on-surface-variant font-black ml-1 whitespace-nowrap">({Math.round(seg.percentage * 100)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
