"use client";

import React from 'react';
import Image from 'next/image';
import { ArtistData } from '@/lib/discogs';

interface ArtistHeroProps {
  artist: ArtistData;
  onClick: (artist: ArtistData) => void;
}

export function ArtistHero({ artist, onClick }: ArtistHeroProps) {
  return (
    <section 
      onClick={() => onClick(artist)}
      className="mb-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 mb-6">
        <span className="font-headline font-black text-[10px] tracking-[0.4em] text-on-surface opacity-40 uppercase">Collection M.V.P.</span>
        <h2 className="font-headline font-black text-7xl md:text-9xl uppercase tracking-tighter leading-[0.8] transition-colors group-hover:text-primary">
          {artist.name}
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-0 relative group">
        <div className="col-span-12 md:col-span-8 h-80 md:h-[400px] bg-surface-container-low overflow-hidden relative shadow-2xl">
          {artist.image ? (
            <Image 
              src={artist.image} 
              alt={artist.name}
              fill
              className="object-cover grayscale opacity-80 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl opacity-20">person</span>
            </div>
          )}
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 ring-inset ring-1 ring-white/10 pointer-events-none" />
        </div>

        <div className="col-span-5 md:col-span-4 bg-primary-container flex flex-col justify-end p-6 md:p-10 shadow-xl z-10 -mt-12 md:mt-0 relative">
          <div className="font-headline font-black text-5xl md:text-7xl text-on-primary-container leading-none">
            {artist.count}
          </div>
          <div className="font-headline text-[10px] md:text-xs uppercase font-black tracking-[0.2em] text-on-primary-container/70 mt-2">
            Pressings in collection
          </div>
          
          {/* Industrial decorative element */}
          <div className="absolute top-6 right-6 opacity-20">
            <span className="material-symbols-outlined text-3xl text-on-primary-container">analytic_check</span>
          </div>
        </div>

        {/* Floating Turntable Pin (Decorative Element from Design) */}
        <div className="absolute -bottom-6 right-12 transform rotate-12 bg-[#131313] p-2 shadow-2xl border border-white/5 hidden md:block">
          <div className="w-24 h-24 bg-[#0E0E0E] rounded-full flex items-center justify-center border-4 border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#521300]"></div>
            </div>
            {/* Spinning Groove lines */}
            <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
          </div>
        </div>
      </div>

      <p className="mt-10 font-body text-xl md:text-2xl italic text-on-surface/80 max-w-md border-l-4 border-primary pl-6 leading-relaxed">
        &ldquo;The rhythm of the needle is the only pulse that matters.&rdquo;
      </p>
    </section>
  );
}
