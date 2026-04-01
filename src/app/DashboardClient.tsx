"use client";

import React, { useEffect, useMemo } from 'react';
import { useDiscogsSync } from '@/context/DiscogsSyncContext';
import { RecentGrid } from '@/components/ui/RecentGrid';

export function DashboardClient() {
  const { releases, startSync, totalItems, isSyncing, progress, isAuthReady, collectionValue } = useDiscogsSync();

  useEffect(() => {
    if (isAuthReady) {
      startSync();
    }
  }, [isAuthReady, startSync]);

  const lightweightReleases = useMemo(() => {
    return [...releases]
      .sort((a, b) => {
        const dateA = new Date(a.date_added).getTime();
        const dateB = new Date(b.date_added).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return b.id - a.id; // Secondary stable sort
      })
      .map((r) => ({
        id: r.id,
        title: r.basic_information.title,
        artist: r.basic_information.artists[0]?.name || 'Unknown',
        imageUrl: r.basic_information.cover_image,
        releaseId: r.basic_information.id,
        year: r.basic_information.year,
        genres: r.basic_information.genres || [],
        styles: r.basic_information.styles || [],
        label: r.basic_information.labels[0]?.name || 'Unknown Label',
        catno: r.basic_information.labels[0]?.catno || 'N/A',
        formats: r.basic_information.formats?.map(f => [f.name, ...(f.descriptions || [])].join(', ')).join(' / ') || 'Unknown Format',
        dateAdded: r.date_added,
      }));
  }, [releases]);

  return (
    <main className="pt-24 px-6 max-w-6xl mx-auto pb-32">
      {/* Dashboard Header / Crate Digger Stats */}
      <section className="mb-16">
        <div className="flex justify-between items-start mb-2">
          <span className="font-headline font-bold uppercase text-[10px] tracking-widest text-primary">CRATE DIGGER DASHBOARD</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          <div className="flex flex-col border-l-2 border-primary pl-6 py-4 bg-surface-container-low/30 hover:bg-surface-container-low transition-colors duration-300">
            <span className="font-headline font-bold uppercase text-xs text-on-surface-variant tracking-tighter mb-2">Total Collection</span>
            <div className="flex items-center gap-3">
              <span className="font-headline font-black text-5xl tracking-tighter text-on-surface">
                {totalItems || '—'}
              </span>
              {totalItems > 0 && (
                <div className="px-2 py-0.5 bg-primary/10 rounded-sm">
                  <span className="font-headline font-bold text-[10px] text-primary uppercase">RECORDS</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col border-l-2 border-secondary pl-6 py-4 bg-surface-container-low/30 hover:bg-surface-container-low transition-colors duration-300">
            <span className="font-headline font-bold uppercase text-xs text-on-surface-variant tracking-tighter mb-2">Estimated Value</span>
            <div className="flex items-center gap-3">
              <span className="font-headline font-black text-4xl tracking-tighter text-secondary">
                {collectionValue?.median || '—'}
              </span>
              {collectionValue && (
                <div className="px-2 py-0.5 bg-secondary/10 rounded-sm">
                  <span className="font-headline font-bold text-[10px] text-secondary uppercase">MEDIAN</span>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex flex-col border-l-2 border-tertiary pl-6 py-4 bg-surface-container-low/30 hover:bg-surface-container-low transition-colors duration-300 relative overflow-hidden">
            <span className="font-headline font-bold uppercase text-xs text-on-surface-variant tracking-tighter mb-2">Data Integrity</span>
            <div className="flex items-center gap-3">
              <span className="font-headline font-black text-4xl tracking-tighter text-tertiary">
                {isSyncing ? `${progress}%` : totalItems > 0 ? '100%' : '—'}
              </span>
              {totalItems > 0 && (
                <div className="px-2 py-0.5 bg-tertiary/10 rounded-sm">
                  <span className="font-headline font-bold text-[10px] text-tertiary uppercase">
                    {isSyncing ? 'SYNCING' : 'SYNCED'}
                  </span>
                </div>
              )}
            </div>
            {isSyncing && (
              <div className="absolute bottom-0 left-0 h-[2px] bg-tertiary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            )}
          </div>
        </div>
      </section>

      {/* Recent Additions Asymmetric Grid */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline font-black text-4xl lg:text-5xl uppercase tracking-tighter leading-none">Recent Additions</h2>
            <p className="font-body italic text-lg text-on-surface-variant mt-2">Freshly unboxed and cataloged in your rotation</p>
          </div>
        </div>

        <RecentGrid releases={lightweightReleases} />

      </section>
    </main>
  );
}
