"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { CrateCard } from './CrateCard';
import { RecordOverlay } from './RecordOverlay';

export interface LightweightRelease {
  id: number;
  title: string;
  artist: string;
  imageUrl?: string;
  releaseId?: number;
  year?: number;
  genres: string[];
  styles: string[];
  label?: string;
  catno?: string;
  formats?: string;
  dateAdded?: string;
}

export function RecentGrid({ releases, initialCount = 20, step = 10 }: { releases: LightweightRelease[], initialCount?: number, step?: number }) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [selectedRelease, setSelectedRelease] = useState<LightweightRelease | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => {
      if (prev >= releases.length) return prev;
      const nextCount = Math.min(prev + step, releases.length);
      console.log(`[RecentGrid] Infinite Scroll load: ${prev} -> ${nextCount} (Total: ${releases.length})`);
      return nextCount;
    });
  }, [releases.length, step]);

  const hasMore = visibleCount < releases.length;

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, {
      rootMargin: '400px', // Start loading before it's actually visible
      threshold: 0
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [handleLoadMore, hasMore]);

  const visibleReleases = releases.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
        {visibleReleases.map((release, i) => (
          <CrateCard 
            key={`${release.id}-${i}`}
            title={release.title} 
            artist={release.artist} 
            imageUrl={release.imageUrl}
            year={release.year}
            genres={release.genres}
            styles={release.styles}
            offset={i % 2 !== 0}
            onClick={() => setSelectedRelease(release)}
          />
        ))}
      </div>
      
      <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
      
      {hasMore && (
        <button 
          onClick={handleLoadMore}
          className="mx-auto mt-4 px-8 py-3 border border-surface-container-high rounded-full font-headline font-bold text-xs uppercase tracking-widest text-on-surface/50 hover:bg-surface-container-high hover:text-primary transition-all active:scale-95 duration-200"
        >
          Load More (+{Math.min(step, releases.length - visibleCount)})
        </button>
      )}

      {selectedRelease && (
        <RecordOverlay 
          release={selectedRelease} 
          onClose={() => setSelectedRelease(null)} 
        />
      )}
    </div>
  );
}
