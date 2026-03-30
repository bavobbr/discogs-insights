"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { DiscogsRelease } from '@/lib/discogs';

interface DiscogsSyncContextType {
  releases: DiscogsRelease[];
  isSyncing: boolean;
  progress: number; // 0 to 100
  totalItems: number;
  syncedCount: number;
  startSync: (initialReleases?: DiscogsRelease[], totalCount?: number, force?: boolean) => void;
}

const DiscogsSyncContext = createContext<DiscogsSyncContextType | undefined>(undefined);

export function DiscogsSyncProvider({ children }: { children: React.ReactNode }) {
  const [releases, setReleases] = useState<DiscogsRelease[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  
  const syncInProgress = useRef(false);
  const syncCompleted = useRef(false);

  // Derive syncedCount and progress from releases state
  React.useEffect(() => {
    setSyncedCount(releases.length);
    if (totalItems > 0) {
      setProgress(Math.min(100, Math.round((releases.length / totalItems) * 100)));
    }
  }, [releases.length, totalItems]);

  const startSync = useCallback(async (initialReleases: DiscogsRelease[] = [], totalCount: number = 0, force: boolean = false) => {
    if ((syncInProgress.current || syncCompleted.current) && !force) return;
    
    syncInProgress.current = true;
    setIsSyncing(true);

    if (force) {
      setReleases([]);
      setSyncedCount(0);
      setProgress(0);
      syncCompleted.current = false;
    }

    // Merge initial releases if we don't have them yet
    setReleases(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const newItems = initialReleases.filter(r => !existingIds.has(r.id));
      return [...prev, ...newItems];
    });

    if (totalCount > 0) {
      setTotalItems(totalCount);
    }

    try {
      let currentPage = 1;
      const perPage = 50;
      let hasNext = true;

      // If we have initial releases, start from page 2 unless we are forcing
      if (initialReleases.length > 0 && !force) {
        currentPage = 2;
      }

      while (hasNext) {
        const res = await fetch(`/api/discogs/sync?page=${currentPage}&per_page=${perPage}${force ? '&force=true' : ''}`);
        if (!res.ok) break;
        
        const data = await res.json();
        const incomingReleases = data.releases as DiscogsRelease[];
        
        if (incomingReleases.length === 0) {
          hasNext = false;
          break;
        }

        setReleases(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const newItems = incomingReleases.filter(r => !existingIds.has(r.id));
          return [...prev, ...newItems];
        });

        // Update total items if provided in pagination
        if (data.pagination.items > totalItems) {
          setTotalItems(data.pagination.items);
        }

        if (!data.pagination.urls.next || currentPage >= data.pagination.pages) {
          hasNext = false;
        } else {
          currentPage++;
          // Minimal delay to let the UI breathe between pages
          await new Promise(r => setTimeout(r, 100));
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
      syncCompleted.current = true;
      setProgress(100);
    }
  }, []);

  return (
    <DiscogsSyncContext.Provider value={{
      releases,
      isSyncing,
      progress,
      totalItems,
      syncedCount,
      startSync
    }}>
      {children}
    </DiscogsSyncContext.Provider>
  );
}

export function useDiscogsSync() {
  const context = useContext(DiscogsSyncContext);
  if (context === undefined) {
    throw new Error('useDiscogsSync must be used within a DiscogsSyncProvider');
  }
  return context;
}
