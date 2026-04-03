"use client";

import Image from 'next/image';
import { ArtistData } from '@/lib/discogs';

interface ArtistCardProps {
  artist: ArtistData;
  rank: number;
  aspect?: 'square' | 'portrait';
  delay?: number;
  onClick: (artist: ArtistData) => void;
}

export function ArtistCard({ artist, rank, aspect = 'square', delay = 0, onClick }: ArtistCardProps) {
  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-[3/4]';
  const rankLabel = rank < 10 ? `#0${rank}` : `#${rank}`;

  return (
    <div 
      onClick={() => onClick(artist)}
      className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 cursor-pointer active:scale-95 transition-all group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`${aspectClass} bg-surface-container-high relative overflow-hidden group shadow-lg`}>
        {artist.image ? (
          <Image 
            src={artist.image} 
            alt={artist.name}
            fill
            className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl opacity-10">person</span>
          </div>
        )}
        
        {/* Rank Badge */}
        <div className="absolute top-0 left-0 bg-[#FF4F00] text-white px-3 py-1.5 font-headline font-black text-sm tracking-tighter shadow-md">
          {rankLabel}
        </div>

        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="space-y-1">
        <h3 className="font-headline font-black text-xl md:text-2xl uppercase leading-none tracking-tight group-hover:text-primary transition-colors">
          {artist.name}
        </h3>
        
        <div className="flex justify-between items-center border-t border-white/10 pt-3 mt-1">
          <span className="font-headline text-[10px] font-black tracking-[0.2em] opacity-40 uppercase">
            {artist.count} RECORDS
          </span>
          <span className="material-symbols-outlined text-primary text-xl active:scale-95 transition-transform hover:translate-x-1 cursor-pointer">
            arrow_forward
          </span>
        </div>
      </div>
    </div>
  );
}
