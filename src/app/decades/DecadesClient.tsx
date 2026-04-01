"use client";

import React, { useEffect } from 'react';
import { useDiscogsSync } from '@/context/DiscogsSyncContext';
import { analyzeDecades } from '@/lib/discogs';
import { DecadeHeatmap } from '@/components/visualizations/DecadeHeatmap';

export function DecadesClient() {
  const { releases, startSync, isSyncing, masterYears, isAuthReady } = useDiscogsSync();

  useEffect(() => {
    if (isAuthReady) {
      startSync();
    }
  }, [isAuthReady, startSync]);

  const { decadeData, totalMapped, peakDecade } = analyzeDecades(releases, masterYears);

  const mapDecade = (
    id: string, label: string, icon: string, iconClass: string, extras?: { translucentBgClass?: string }
  ) => {
    const obj = decadeData[id] || { count: 0, images: [], releases: [] };
    return {
      id,
      label,
      icon,
      count: obj.count,
      percentage: totalMapped > 0 ? (obj.count / totalMapped) * 100 : 0,
      images: obj.images,
      releases: obj.releases,
      isPeak: peakDecade === id,
      iconClass,
      textClass: iconClass,
      ...extras
    };
  };

  const heatMapData = [
    mapDecade('1950s', '50s', 'radio', 'text-outline opacity-40'),
    mapDecade('1960s', '60s', 'album', 'text-outline opacity-60'),
    mapDecade('1970s', '70s', 'star', 'text-primary'),
    mapDecade('1980s', '80s', 'graphic_eq', 'text-secondary', { translucentBgClass: 'bg-secondary/20' }),
    mapDecade('1990s', '90s', 'cable', 'text-[var(--on-tertiary-container)]', { translucentBgClass: 'bg-tertiary/20' }),
    mapDecade('2000s', '00s', 'rebase_edit', 'text-[var(--on-surface-variant)] opacity-40'),
    mapDecade('2010s', '10s', 'blur_on', 'text-primary opacity-80'),
    mapDecade('2020s', '20s', 'waves', 'text-primary'),
  ];

  return (
    <main className="pt-24 pb-32 px-6 min-h-screen max-w-6xl mx-auto">
      {/* Header Section */}
      <section className="mb-16">
        <div className="flex justify-between items-end">
          <div>
            <span className="font-headline font-bold uppercase text-[10px] tracking-widest text-primary mb-2 block">STATISTICS</span>
            <h2 className="text-5xl lg:text-7xl font-black font-headline tracking-tighter uppercase leading-none">Decade Heatmap</h2>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-right">
              <span className="font-headline font-bold text-4xl text-secondary">{totalMapped}</span>
              <span className="font-headline font-bold uppercase text-[10px] block text-on-surface-variant opacity-60 tracking-[0.2em]">RECORDS</span>
            </div>
          </div>
        </div>
        <p className="mt-6 font-body italic text-xl text-on-surface-variant max-w-3xl leading-tight">
            A visual archeology of sound, tracing the evolution of your collection from mid-century jazz to contemporary digital-analog hybrids.
        </p>
      </section>

      <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start">
        {/* Decade Heatmap Component (Primary) */}
        <div className="lg:col-span-8 mb-12 lg:mb-0">
            <DecadeHeatmap data={heatMapData} />
        </div>

        {/* Insights Surface (Secondary) */}
        <section className="lg:col-span-4 bg-surface-container-high/30 p-8 rounded-3xl border border-[#E5E2E1]/5 backdrop-blur-md">
          <h3 className="font-headline font-bold uppercase text-xs tracking-[0.3em] text-secondary mb-8">Collection Analysis</h3>
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 flex-shrink-0 bg-surface-container-lowest flex items-center justify-center rounded-xl border border-[#E5E2E1]/5">
                <span className="material-symbols-outlined text-primary">timeline</span>
              </div>
              <div>
                <p className="font-headline font-bold uppercase text-[10px] text-on-surface-variant/60 tracking-widest mb-1">Trend Profile</p>
                <p className="font-body text-lg italic leading-tight">Your collection spans across {totalMapped} distinct release years.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 flex-shrink-0 bg-surface-container-lowest flex items-center justify-center rounded-xl border border-[#E5E2E1]/5">
                <span className="material-symbols-outlined text-secondary">update</span>
              </div>
              <div>
                <p className="font-headline font-bold uppercase text-[10px] text-on-surface-variant/60 tracking-widest mb-1">Data Health</p>
                <p className="font-body text-lg italic leading-tight">Release metadata is {isSyncing ? 'synchronizing...' : 'synchronized with current Discogs master records.'}</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 flex-shrink-0 bg-surface-container-lowest flex items-center justify-center rounded-xl border border-[#E5E2E1]/5">
                <span className="material-symbols-outlined text-tertiary">analytics</span>
              </div>
              <div>
                <p className="font-headline font-bold uppercase text-[10px] text-on-surface-variant/60 tracking-widest mb-1">Peak Era</p>
                <p className="font-body text-lg italic leading-tight">The {peakDecade} represents the densest concentration of your library.</p>
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
