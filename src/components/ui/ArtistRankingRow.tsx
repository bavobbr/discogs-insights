"use client";

import { ArtistData } from '@/lib/discogs';

interface ArtistRankingRowProps {
  artist: ArtistData;
  rank: number;
  onClick: (artist: ArtistData) => void;
}

export function ArtistRankingRow({ artist, rank, onClick }: ArtistRankingRowProps) {
  const rankLabel = rank < 10 ? `0${rank}` : `${rank}`;
  
  // Heuristic for primary genre/style
  const primaryGenre = artist.releases[0]?.basic_information.genres?.[0] || 
                      artist.releases[0]?.basic_information.styles?.[0] || 
                      "Various Styles";

  return (
    <div 
      onClick={() => onClick(artist)}
      className="group flex items-center justify-between py-6 border-b border-surface-container-high last:border-0 cursor-pointer active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-8">
        <span className="font-headline font-black text-5xl md:text-6xl text-stroke opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all duration-500">
          {rankLabel}
        </span>
        <div>
          <h3 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter group-hover:translate-x-1 transition-transform">
            {artist.name}
          </h3>
          <p className="font-body italic text-on-surface/60 group-hover:text-on-surface/90 transition-colors">
            {primaryGenre} &amp; Experimental
          </p>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end">
        <div className="font-headline font-black text-xl md:text-2xl text-primary/80 group-hover:text-primary group-hover:scale-110 transition-all origin-right">
          {artist.count}
        </div>
        <div className="font-headline text-[9px] tracking-[0.2em] font-black opacity-30 uppercase group-hover:opacity-60">
          Albums
        </div>
        
        {/* Subtle dot-matrix indicator */}
        <div className="flex gap-0.5 mt-2 opacity-20 group-hover:opacity-50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full ${i < (artist.count / 5) ? 'bg-primary' : 'bg-white'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
