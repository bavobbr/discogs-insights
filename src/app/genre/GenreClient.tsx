"use client";

import React, { useEffect, useState } from 'react';
import { useDiscogsSync } from '@/context/DiscogsSyncContext';
import { analyzeGenres, getTopVibrations, VibrationItem, DiscogsRelease } from '@/lib/discogs';
import { GenreStyleMatrix } from '@/components/visualizations/GenreStyleMatrix';
import { CrateDiggingOverlay } from '@/components/ui/CrateDiggingOverlay';

const STAT_INFO = {
  topGenres: {
    label: 'Dominant Genre',
    unit: 'records',
    color: 'text-secondary',
    borderHover: 'hover:border-secondary/20',
    description: 'The genres with the most records in your collection, ranked by total count.',
  },
  risingRhythms: {
    label: 'Rising Rhythm',
    unit: 'added recently',
    color: 'text-tertiary',
    borderHover: 'hover:border-tertiary/20',
    description: 'Genres you\'ve been collecting most actively in the past year.',
  },
  signatureStyles: {
    label: 'Signature Style',
    unit: 'records',
    color: 'text-primary',
    borderHover: 'hover:border-primary/20',
    description: 'The specific styles and subgenres that appear most across your collection — the sonic DNA of your crates.',
  },
} as const;

type StatKey = keyof typeof STAT_INFO;

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="relative group/tooltip">
      <button
        className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-on-surface/40 hover:text-on-surface hover:border-white/40 transition-colors"
        aria-label="More info"
        onClick={e => e.stopPropagation()}
      >
        <span className="material-symbols-outlined text-[12px]">info</span>
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-surface-container-highest border border-white/10 rounded-xl p-3 shadow-2xl pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50">
        <p className="font-body text-xs text-on-surface/70 leading-relaxed">{text}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-surface-container-highest"></div>
      </div>
    </div>
  );
}

const COLLAPSED_COUNT = 3;

function StatSection({
  statKey,
  items,
  onSelect,
}: {
  statKey: StatKey;
  items: VibrationItem[];
  onSelect: (item: VibrationItem, label: string) => void;
}) {
  const info = STAT_INFO[statKey];
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, COLLAPSED_COUNT);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={`font-label font-bold uppercase text-[10px] tracking-widest ${info.color}`}>
          {info.label}
        </span>
        <InfoTooltip text={info.description} />
      </div>

      <div className="divide-y divide-white/5">
        {visible.map((item, i) => (
          <button
            key={item.name}
            onClick={() => onSelect(item, `${info.label}: ${item.name}`)}
            className="w-full py-2.5 px-1 flex items-center justify-between group hover:bg-white/[0.03] transition-colors duration-150 text-left rounded-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-label font-black text-[9px] text-on-surface/25 tabular-nums w-4 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-headline font-black text-base uppercase text-on-surface group-hover:text-primary transition-colors truncate leading-none">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="font-label font-bold text-sm text-on-surface/60 tabular-nums">
                {statKey === 'risingRhythms' ? `+${item.count}` : item.count}
              </span>
              <span className="font-body italic text-[9px] text-on-surface/30">{info.unit}</span>
              <span className="material-symbols-outlined text-[13px] text-on-surface/15 group-hover:text-primary/50 transition-colors">
                chevron_right
              </span>
            </div>
          </button>
        ))}
      </div>

      {items.length > COLLAPSED_COUNT && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-1 px-1 flex items-center gap-1 text-on-surface/30 hover:text-on-surface/60 transition-colors"
        >
          <span className="font-label font-bold uppercase text-[9px] tracking-widest">
            {expanded ? 'Show less' : `+${items.length - COLLAPSED_COUNT} more`}
          </span>
          <span className="material-symbols-outlined text-[11px]">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      )}
    </div>
  );
}

export function GenreClient() {
  const { releases, startSync, isAuthReady } = useDiscogsSync();
  const [overlayItem, setOverlayItem] = useState<{ releases: DiscogsRelease[]; subtitle: string } | null>(null);

  useEffect(() => {
    if (isAuthReady) {
      startSync();
    }
  }, [isAuthReady, startSync]);

  const genreData = analyzeGenres(releases);
  const topVibrations = getTopVibrations(releases);

  const handleSelect = (item: VibrationItem, subtitle: string) => {
    setOverlayItem({ releases: item.releases, subtitle });
  };

  return (
    <main className="pt-24 pb-32 px-4 md:px-12 min-h-screen max-w-6xl mx-auto">

      {/* Header Section */}
      <section className="mb-12">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="font-label font-black uppercase text-[9px] tracking-[0.3em] text-primary mb-2 block animate-pulse">ATMOSPHERES</span>
            <h2 className="font-headline font-black text-5xl lg:text-7xl uppercase tracking-tighter leading-none mt-2">Genre Matrix</h2>
          </div>
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
          <section className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-grow bg-surface-container-high"></div>
              <h3 className="font-headline font-bold uppercase text-xs tracking-[0.3em] text-on-surface-variant flex-shrink-0">Analytics</h3>
              <div className="h-[1px] flex-grow bg-surface-container-high"></div>
            </div>

            <StatSection statKey="topGenres" items={topVibrations.topGenres} onSelect={handleSelect} />
            <StatSection statKey="risingRhythms" items={topVibrations.risingRhythms} onSelect={handleSelect} />
            <StatSection statKey="signatureStyles" items={topVibrations.signatureStyles} onSelect={handleSelect} />

            {/* Data Note */}
            <div className="mt-4 p-6 rounded-2xl bg-surface-container-lowest/50 border border-[#E5E2E1]/5">
              <p className="font-body italic text-sm text-on-surface-variant leading-relaxed">
                Analytics are derived from your real-time Discogs library data, reflecting the core DNA of your musical exploration.
              </p>
            </div>
          </section>
        )}
      </div>

      {overlayItem && (
        <CrateDiggingOverlay
          subtitle={overlayItem.subtitle}
          releases={overlayItem.releases}
          onClose={() => setOverlayItem(null)}
        />
      )}
    </main>
  );
}
