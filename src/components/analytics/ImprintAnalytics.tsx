"use client";

import React, { useMemo } from 'react';
import { DiscogsRelease, ReleaseDetails } from '@/lib/discogs';

interface ImprintAnalyticsProps {
  releases: DiscogsRelease[];
  vaultMetadata: Record<number, ReleaseDetails>;
}

export function ImprintAnalytics({ releases, vaultMetadata }: ImprintAnalyticsProps) {
  // Aggregate data
  const data = useMemo(() => {
    const labels: Record<string, number> = {};
    const countries: Record<string, number> = {};
    
    releases.forEach(r => {
      // Countries - SOURCED FROM VAULT METADATA
      const details = vaultMetadata[r.id];
      const country = details?.country || "Unknown";
      countries[country] = (countries[country] || 0) + 1;
      
      // Labels
      r.basic_information.labels?.forEach(l => {
        // CLEANING: Remove Discogs numbering
        const name = l.name?.replace(/\s\(\d+\)$/, "");
        if (name && name !== "Not On Label") {
          labels[name] = (labels[name] || 0) + 1;
        }
      });
    });
    
    const sortedLabels = Object.entries(labels)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40); // Expanded for the matrix
      
    const sortedCountries = Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
      
    const maxLabelCount = sortedLabels[0]?.[1] || 1;
      
    return {
      topLabels: sortedLabels,
      topCountries: sortedCountries,
      uniqueLabelsCount: Object.keys(labels).length,
      importCount: releases.length - (countries["US"] || 0) - (countries["Unknown"] || 0),
      maxLabelCount
    };
  }, [releases, vaultMetadata]);

  return (
    <section className="py-24 border-t border-white/5 relative overflow-hidden bg-black/20">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.03)_0%,_transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-headline font-black text-5xl uppercase tracking-tighter text-white mb-3">THE IMPRINT</h2>
            <p className="font-body italic text-on-surface-variant/50 max-w-xl text-lg">
              Deconstructing the industrial and geographic DNA of your archive.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 mb-1">TOTAL ENTITIES</p>
                <p className="text-2xl font-headline font-black text-white italic">{data.uniqueLabelsCount}</p>
             </div>
             <div className="px-5 py-3 bg-secondary/5 border border-secondary/10 rounded-xl backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary/40 mb-1">IMPORT RATIO</p>
                <p className="text-2xl font-headline font-black text-secondary italic">
                  {Math.round((data.importCount / Math.max(1, releases.length)) * 100)}%
                </p>
             </div>
          </div>
        </header>

        {/* Geographical Origins: Horizontal Distribution */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-headline font-bold text-[10px] uppercase tracking-[0.3em] text-secondary">Manufacturing Origins</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.topCountries.map(([name, count]) => (
              <div key={name} className="relative group">
                <div className="flex items-end justify-between mb-2">
                  <span className="font-headline font-bold text-xs text-white/80 uppercase tracking-widest">{name}</span>
                  <span className="font-headline font-black text-lg text-secondary italic">{count}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary shadow-[0_0_8px_var(--secondary)] transition-all duration-1000 ease-out"
                    style={{ width: `${(count / releases.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Label Constellation (Tactile Wordcloud) */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <span className="font-headline font-bold text-[10px] uppercase tracking-[0.3em] text-primary">Label Constellation</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          
          <div className="flex flex-wrap gap-x-12 gap-y-6 justify-center">
            {useMemo(() => [...data.topLabels].sort(() => Math.sin(data.uniqueLabelsCount) - 0.5), [data.topLabels, data.uniqueLabelsCount]).map(([name, count]) => {
              const weight = count / data.maxLabelCount;
              
              // Map colors based on importance
              let color = 'rgba(255,255,255,0.2)';
              let glow = 'none';
              
              if (weight > 0.8) {
                color = '#FBBF24'; // Primary Gold
                glow = '0 0 20px rgba(251, 191, 36, 0.4)';
              } else if (weight > 0.4) {
                color = '#2DD4BF'; // Secondary Teal
                glow = '0 0 15px rgba(45, 212, 191, 0.3)';
              } else if (weight > 0.15) {
                color = 'rgba(255,255,255,0.7)';
              }
              
              return (
                <div 
                  key={name}
                  className="transition-all duration-500 hover:scale-110 cursor-default group"
                >
                  <div className="flex items-baseline gap-2">
                    <span 
                      className="font-headline font-black italic uppercase tracking-tighter leading-none block"
                      style={{ 
                        fontSize: `${1 + (weight * 2.5)}rem`,
                        color: color,
                        textShadow: glow,
                        opacity: 0.3 + (weight * 0.7)
                      }}
                    >
                      {name}
                    </span>
                    {weight > 0.3 && (
                      <span className="font-body text-[10px] text-white/10 italic font-black group-hover:text-primary transition-colors">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
