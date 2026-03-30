"use client";

import React from 'react';
import Image from 'next/image';
import { DiscogsRelease, ReleaseDetails } from '@/lib/discogs';

interface VaultPedestalProps {
  release: DiscogsRelease;
  details?: ReleaseDetails;
  rank: number;
  variant?: 'large' | 'small';
  onClick?: () => void;
}

export function VaultPedestal({ release, details, rank, variant = 'large', onClick }: VaultPedestalProps) {
  const isSmall = variant === 'small';
  const wantToHaveRatio = details 
    ? (details.community.want / Math.max(1, details.community.have)).toFixed(1)
    : null;

  return (
    <div 
      className={`relative group flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Spotlight Effect */}
      <div className={`absolute -top-20 left-1/2 -translate-x-1/2 ${isSmall ? 'w-32 h-64' : 'w-48 h-96'} bg-primary/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none`} />
      
      {/* Rank Indicator */}
      <div className={`absolute -top-4 -left-4 z-20 ${isSmall ? 'w-8 h-8' : 'w-10 h-10'} bg-primary flex items-center justify-center rounded-full border-4 border-[#090909] shadow-xl`}>
        <span className={`font-headline font-black text-black ${isSmall ? 'text-[10px]' : 'text-sm'}`}>{rank}</span>
      </div>

      {/* The Record - Elevated */}
      <div className={`relative z-10 w-full aspect-square ${isSmall ? 'mb-4' : 'mb-8'} transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
        {release.basic_information.cover_image ? (
          <Image 
            src={release.basic_information.cover_image}
            alt={release.basic_information.title}
            fill
            className="object-cover rounded-sm"
            sizes="300px"
          />
        ) : (
          <div className="w-full h-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl opacity-20">album</span>
          </div>
        )}
        
        {/* Subtle Shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      {/* The Pedestal */}
      <div className="relative w-full h-4 bg-gradient-to-b from-[#1a1a1a] to-[#090909] perspective-1000">
        <div className="absolute inset-0 border-t border-primary/30 blur-[1px]" />
        <div className="absolute inset-0 border-t border-primary/20" />
        
        {/* Ground Glow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-primary/10 blur-xl rounded-full" />
      </div>

      {/* Info Card */}
      <div className={`${isSmall ? 'mt-4' : 'mt-8'} text-center space-y-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
        <h3 className={`font-headline font-bold ${isSmall ? 'text-xs uppercase leading-tight' : 'text-lg uppercase tracking-tight'} line-clamp-1 text-on-surface`}>
          {release.basic_information.title}
        </h3>
        <p className={`font-body italic ${isSmall ? 'text-[10px]' : 'text-sm'} text-on-surface-variant line-clamp-1`}>
          {release.basic_information.artists[0]?.name}
        </p>
        
        {details && (
          <div className={`flex ${isSmall ? 'gap-2' : 'gap-4'} justify-center pt-2`}>
            <div className="flex flex-col items-center">
              <span className={`font-headline font-bold ${isSmall ? 'text-[8px]' : 'text-[10px]'} text-primary/60 tracking-widest uppercase`}>W/H</span>
              <span className={`font-headline font-black ${isSmall ? 'text-[10px]' : 'text-xs'} text-primary`}>{wantToHaveRatio}x</span>
            </div>
            {details.lowest_price && (
              <div className="flex flex-col items-center">
                <span className={`font-headline font-bold ${isSmall ? 'text-[8px]' : 'text-[10px]'} text-green-500/60 tracking-widest uppercase`}>VAL</span>
                <span className={`font-headline font-black ${isSmall ? 'text-[10px]' : 'text-xs'} text-green-500`}>${details.lowest_price.toFixed(0)}</span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className={`font-headline font-bold ${isSmall ? 'text-[8px]' : 'text-[10px]'} text-secondary/60 tracking-widest uppercase`}>RTG</span>
              <span className={`font-headline font-black ${isSmall ? 'text-[10px]' : 'text-xs'} text-secondary`}>{details.community.rating.average.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
