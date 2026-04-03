"use client";

import React, { useMemo } from 'react';
import { useDiscogsSync } from '@/context/DiscogsSyncContext';
import { analyzeArtists, ArtistData } from '@/lib/discogs';
import { ArtistHero } from '@/components/ui/ArtistHero';
import { ArtistCard } from '@/components/ui/ArtistCard';
import { ArtistRankingRow } from '@/components/ui/ArtistRankingRow';
import { CrateDiggingOverlay } from '@/components/ui/CrateDiggingOverlay';

export function ArtistClient() {
  const { releases, isSyncing } = useDiscogsSync();
  const [selectedArtist, setSelectedArtist] = React.useState<ArtistData | null>(null);

  const artistData = useMemo(() => {
    if (!releases.length) return [];
    return analyzeArtists(releases);
  }, [releases]);

  const handleArtistClick = (artist: ArtistData) => {
    // Optional: Add haptic feedback if supported
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
    setSelectedArtist(artist);
  };

  if (isSyncing && artistData.length === 0) {
    return (
      <div className="pt-32 px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin mb-6" />
        <h2 className="font-headline font-black text-2xl uppercase tracking-tighter animate-pulse">
          Analyzing Artist Rhythms...
        </h2>
      </div>
    );
  }

  if (artistData.length === 0) {
    return (
      <div className="pt-32 px-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="material-symbols-outlined text-6xl opacity-20 mb-4">person_off</span>
        <h2 className="font-headline font-black text-2xl uppercase tracking-tighter">
          No Artists Found
        </h2>
        <p className="font-body text-on-surface/60 mt-2 max-w-xs">
          Sync your collection to see who dominates your crates.
        </p>
      </div>
    );
  }

  const mvp = artistData[0];
  const gridArtists = artistData.slice(1, 5);
  const listArtists = artistData.slice(5, 15);

  return (
    <div className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      {/* Hero Section */}
      <ArtistHero artist={mvp} onClick={handleArtistClick} />

      {/* Staggered Grid Section */}
      <div className="mt-24 mb-32">
        <h2 className="font-headline font-black text-4xl uppercase tracking-tighter mb-12 border-b-4 border-surface-container-highest pb-4 inline-block">
          The Inner Circle
        </h2>
        
        <div className="grid grid-cols-2 gap-6 md:gap-12 items-start">
          {gridArtists[0] && (
            <div className="pt-0">
              <ArtistCard artist={gridArtists[0]} rank={2} aspect="square" delay={100} onClick={handleArtistClick} />
            </div>
          )}
          {gridArtists[1] && (
            <div className="pt-16 md:pt-24">
              <ArtistCard artist={gridArtists[1]} rank={3} aspect="square" delay={200} onClick={handleArtistClick} />
            </div>
          )}
          {gridArtists[2] && (
            <div className="pt-0">
              <ArtistCard artist={gridArtists[2]} rank={4} aspect="portrait" delay={300} onClick={handleArtistClick} />
            </div>
          )}
          {gridArtists[3] && (
            <div className="pt-16 md:pt-24">
              <ArtistCard artist={gridArtists[3]} rank={5} aspect="square" delay={400} onClick={handleArtistClick} />
            </div>
          )}
        </div>
      </div>

      {/* Ranking List Section */}
      <div className="space-y-4 mb-20">
        <h2 className="font-headline font-black text-4xl uppercase tracking-tighter mb-8 border-b-4 border-surface-container-highest pb-4 inline-block">
          Deep Stack
        </h2>
        
        <div className="flex flex-col gap-3">
          {listArtists.map((artist, index) => (
            <ArtistRankingRow 
              key={artist.id} 
              artist={artist} 
              rank={index + 6} 
              onClick={handleArtistClick}
            />
          ))}
        </div>
      </div>

      {/* Technical Metadata Footer */}
      <footer className="mt-20 py-12 border-t-4 border-surface-container-highest animate-in fade-in duration-1000 delay-500">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-primary">COLLECTION STATS</div>
            <div className="font-headline font-black text-4xl tracking-tighter uppercase">{artistData.length} TOTAL ARTISTS</div>
          </div>
          <div className="w-14 h-14 bg-primary-container rounded-sm flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform cursor-help">
            <span className="material-symbols-outlined text-3xl text-on-primary-container font-bold">analytics</span>
          </div>
        </div>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="font-body text-sm text-on-surface/40 leading-relaxed max-w-sm">
             Sorted by density / last play / weighted preference score. Index generated at 124.5bpm.
             All metadata normalized for the Analog Archivist protocol.
           </div>
           <div className="font-headline text-[8px] tracking-[0.4em] uppercase text-on-surface/20 md:text-right self-end">
             Deep Groove Systems ©1978-2024. <br />
             STITCH_PROTOCOL_V4_ARTIST_INSIGHT
           </div>
        </div>
      </footer>

      {/* Crate Digging Overlay */}
      {selectedArtist && (
        <CrateDiggingOverlay
          onClose={() => setSelectedArtist(null)}
          title={selectedArtist.name}
          subtitle={`${selectedArtist.name} COLLECTION`}
          releases={selectedArtist.releases}
        />
      )}

      {/* Noise Overlay is global in globals.css */}
    </div>
  );
}
