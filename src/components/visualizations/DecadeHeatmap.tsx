"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { DiscogsRelease } from '@/lib/discogs';
import { CrateDiggingOverlay } from '@/components/ui/CrateDiggingOverlay';

export interface DecadeData {
  id: string;
  label: string;
  icon: string;
  count: number;
  percentage: number;
  images: string[];
  releases: DiscogsRelease[];
  isPeak: boolean;
  textClass: string;
  iconClass: string;
}

export function DecadeHeatmap({ data }: { data: DecadeData[] }) {
  const [selectedDecade, setSelectedDecade] = useState<DecadeData | null>(null);

  // Renders a smart NxN mosaic grid filling the absolute space
  const renderBackgroundMosaic = (decade: DecadeData) => {
    const imgs = decade.images;
    if (imgs.length === 0) {
      return <div className="absolute inset-0 bg-surface-container-low"></div>;
    }

    // Determine grid columns: 1x1, 2x2, or 3x3
    let gridCols = 'grid-cols-1 grid-rows-1';
    let max = 1;

    if (imgs.length >= 9) {
      gridCols = 'grid-cols-3 grid-rows-3';
      max = 9;
    } else if (imgs.length >= 4) {
      gridCols = 'grid-cols-2 grid-rows-2';
      max = 4;
    }

    const visibleImages = imgs.slice(0, max);

    return (
      <div className={`absolute inset-0 grid ${gridCols} gap-0`}>
        {visibleImages.map((img, idx) => (
          <div key={idx} className="relative w-full h-full">
            <Image
              alt={`${decade.id} mosaic tile`}
              className="object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500"
              src={img}
              fill
              sizes="(max-width: 768px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>
    );
  };

  const openDecade = (decade: DecadeData) => {
    setSelectedDecade(decade);
  };

  const closeDecade = () => {
    setSelectedDecade(null);
  };

  return (
    <>
      <section className="grid grid-cols-2 gap-4">
        {data.map((decade) => {

          // 1) Render the Golden Era (Double Span)
          if (decade.isPeak) {
            return (
              <div
                key={decade.id}
                onClick={() => openDecade(decade)}
                className="relative bg-surface p-5 flex flex-col justify-between aspect-[2/1] col-span-2 group active:scale-95 cursor-pointer transition-transform overflow-hidden rounded-md border border-surface-container-high hover:border-primary/50"
              >

                {renderBackgroundMosaic(decade)}

                {/* Overlay Gradient to protect legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <span className="font-headline font-black text-4xl text-primary drop-shadow-md">{decade.label}</span>
                    <span className="font-headline font-bold uppercase text-[10px] tracking-widest block text-primary-container drop-shadow-md">Golden Era</span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-3xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-4 mt-auto">
                  <span className="font-headline font-black text-lg drop-shadow-md whitespace-nowrap">{decade.count} ITEMS</span>
                  <div className="flex-grow h-1.5 bg-surface-container-highest/60 rounded-full overflow-hidden shadow-inner drop-shadow-md">
                    <div className="h-full bg-primary" style={{ width: `${decade.percentage}%` }}></div>
                  </div>
                  <span className="font-headline font-black text-lg drop-shadow-md">{decade.percentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          }

          // 2) Render Normal Layout
          return (
            <div
              key={decade.label}
              onClick={() => openDecade(decade)}
              className="relative bg-surface flex flex-col justify-between aspect-square group active:scale-95 cursor-pointer transition-transform overflow-hidden rounded-md border border-surface-container-high hover:border-surface-variant"
            >

              {renderBackgroundMosaic(decade)}

              {/* Overlay Gradient to protect legibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-transparent to-surface/90 pointer-events-none"></div>

              <div className="relative z-10 flex justify-between items-start p-4">
                <span className={`font-headline font-black text-2xl ${decade.textClass} drop-shadow-md`}>{decade.label}</span>
                <span className={`material-symbols-outlined ${decade.iconClass} drop-shadow-md`}>{decade.icon}</span>
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3 p-4 mt-auto">
                <span className="font-headline font-bold uppercase text-[10px] tracking-widest text-on-surface drop-shadow-md whitespace-nowrap">{decade.count} ITEMS</span>
                <div className="flex-grow h-1 bg-surface-container-highest/60 rounded-full overflow-hidden shadow-inner drop-shadow-md opacity-70">
                  <div className="h-full bg-primary" style={{ width: `${decade.percentage}%` }}></div>
                </div>
                <span className="font-headline font-bold text-xs text-on-surface drop-shadow-md">{decade.percentage.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Crate Digging Overlay */}
      {selectedDecade && (
        <CrateDiggingOverlay
          subtitle={`${selectedDecade.label} COLLECTION`}
          releases={selectedDecade.releases}
          onClose={closeDecade}
        />
      )}
    </>
  );
}
