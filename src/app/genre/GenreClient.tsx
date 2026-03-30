"use client";

import React, { useEffect } from 'react';
import { useDiscogsSync } from '@/context/DiscogsSyncContext';
import { DiscogsRelease, analyzeGenres, getTopVibrations } from '@/lib/discogs';
import { GenreStyleMatrix } from '@/components/visualizations/GenreStyleMatrix';

interface GenreClientProps {
  initialReleases: DiscogsRelease[];
  totalItems: number;
}

export function GenreClient({ initialReleases, totalItems: initialTotal }: GenreClientProps) {
  const { releases: contextReleases, startSync, isSyncing, progress } = useDiscogsSync();

  // Instant hydration fallback
  const releases = contextReleases.length > 0 ? contextReleases : initialReleases;

  useEffect(() => {
    startSync(initialReleases, initialTotal);
  }, [initialReleases, initialTotal, startSync]);

  const genreData = analyzeGenres(releases);
  const topVibrations = getTopVibrations(releases);

  return (
    <main className="pt-24 pb-32 px-4 md:px-12 min-h-screen max-w-6xl mx-auto">
      
      {/* Header Section */}
      <section className="mb-12">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="font-label font-black uppercase text-[9px] tracking-[0.3em] text-primary mb-2 block animate-pulse">ATMOSPHERES</span>
            <h2 className="font-headline font-black text-5xl lg:text-7xl uppercase tracking-tighter leading-none mt-2">Genre Matrix</h2>
          </div>
          {isSyncing && (
            <div className="text-right">
              <span className="font-headline font-bold uppercase text-[10px] text-primary/60 tracking-widest block mb-1">Syncing Data</span>
              <div className="h-1 w-32 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
        <p className="font-body text-xl italic text-on-surface-variant mt-4 max-w-2xl leading-tight">
          A deep dive into the specific vibrations and styles that define your rotation.
        </p>
      </section>

      {/* Content Grid */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start">
        
        {/* Genre Style Matrix Section (Primary) */}
        <section className="lg:col-span-7 mb-20 lg:mb-0">
          <div className="p-4 lg:p-8 bg-surface-container-low/20 rounded-3xl border border-[#E5E2E1]/5 backdrop-blur-xl">
            <GenreStyleMatrix data={genreData} />
          </div>
        </section>

        {/* Top Vibrations Section (Secondary) */}
        {topVibrations && (
          <section className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-grow bg-surface-container-high"></div>
              <h3 className="font-headline font-bold uppercase text-xs tracking-[0.3em] text-on-surface-variant flex-shrink-0">Analytics</h3>
              <div className="h-[1px] flex-grow bg-surface-container-high"></div>
            </div>
            
            <div className="bg-surface-container-low p-6 flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300 border border-transparent hover:border-primary/20 rounded-xl">
              <div className="flex flex-col">
                <span className="font-label font-bold uppercase text-[10px] text-secondary tracking-widest mb-1">Dominant Genre</span>
                <span className="font-headline font-black text-3xl uppercase text-on-surface group-hover:text-primary transition-colors">{topVibrations.topGenre.name}</span>
              </div>
              <div className="text-right">
                <span className="font-label font-bold text-3xl text-on-surface">{topVibrations.topGenre.count}</span>
                <p className="font-body italic text-xs text-on-surface-variant leading-none mt-1">units</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300 border border-transparent hover:border-tertiary/20 rounded-xl">
              <div className="flex flex-col">
                <span className="font-label font-bold uppercase text-[10px] text-tertiary tracking-widest mb-1">Rising Rhythm</span>
                <span className="font-headline font-black text-3xl uppercase text-on-surface group-hover:text-primary transition-colors">{topVibrations.risingRhythm.name}</span>
              </div>
              <div className="text-right">
                <span className="font-label font-bold text-3xl text-on-surface">+{topVibrations.risingRhythm.count}</span>
                <p className="font-body italic text-xs text-on-surface-variant leading-none mt-1">velocity</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300 border border-transparent hover:border-primary/20 rounded-xl">
              <div className="flex flex-col">
                <span className="font-label font-bold uppercase text-[10px] text-primary tracking-widest mb-1">Hidden Gem</span>
                <span className="font-headline font-black text-3xl uppercase text-on-surface group-hover:text-primary transition-colors">{topVibrations.hiddenGem.name}</span>
              </div>
              <div className="text-right">
                <span className="font-label font-bold text-3xl text-on-surface">{topVibrations.hiddenGem.count}</span>
                <p className="font-body italic text-xs text-on-surface-variant leading-none mt-1">curated</p>
              </div>
            </div>

            {/* Data Note */}
            <div className="mt-12 p-6 rounded-2xl bg-surface-container-lowest/50 border border-[#E5E2E1]/5">
              <p className="font-body italic text-sm text-on-surface-variant leading-relaxed">
                Analytics are derived from your real-time Discogs library data, reflecting the core DNA of your musical exploration.
              </p>
            </div>
          </section>
        )}
      </div>

    </main>
  );
}
