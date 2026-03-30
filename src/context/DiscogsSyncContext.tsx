"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { DiscogsRelease, ReleaseDetails } from '@/lib/discogs';

interface DiscogsSyncContextType {
  releases: DiscogsRelease[];
  isSyncing: boolean;
  progress: number; // 0 to 100
  totalItems: number;
  syncedCount: number;
  vaultMetadata: Record<number, ReleaseDetails>;
  isSyncingVault: boolean;
  vaultScannedCount: number;
  vaultTotalCount: number;
  startSync: (initialReleases?: DiscogsRelease[], totalCount?: number, force?: boolean) => void;
  syncVaultData: (candidateIds: number[]) => Promise<void>;
}

const DiscogsSyncContext = createContext<DiscogsSyncContextType | undefined>(undefined);

export function DiscogsSyncProvider({ children }: { children: React.ReactNode }) {
  const [releases, setReleases] = useState<DiscogsRelease[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const [vaultMetadata, setVaultMetadata] = useState<Record<number, ReleaseDetails>>({});
  const [isSyncingVault, setIsSyncingVault] = useState(false);
  const [vaultScannedCount, setVaultScannedCount] = useState(0);
  const [vaultTotalCount, setVaultTotalCount] = useState(0);
  
  const syncInProgress = useRef(false);
  const syncCompleted = useRef(false);
  const vaultSyncInProgress = useRef(false);

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
  }, [totalItems]);

  const syncVaultData = useCallback(async (candidateIds: number[]) => {
    if (vaultSyncInProgress.current) return;
    vaultSyncInProgress.current = true;
    setIsSyncingVault(true);
    setVaultScannedCount(0);
    setVaultTotalCount(candidateIds.length);

    try {
      for (const id of candidateIds) {
        // Increment progress even if cached
        setVaultScannedCount(prev => prev + 1);

        // Skip if already have it in local state
        if (vaultMetadata[id]) continue;

        const res = await fetch(`/api/discogs/release/${id}`);
        if (res.ok) {
          const details = await res.json();
          setVaultMetadata(prev => ({ ...prev, [id]: details }));
        }
        
        // Stand back and let the backend handle the 1s rate limiter.
        // We use a minimal delay (50ms) to allow the UI to process each arriving record
        // without blocking the main thread.
        await new Promise(r => setTimeout(r, 50));
      }
    } catch (error) {
      console.error("Vault sync error:", error);
    } finally {
      setIsSyncingVault(false);
      vaultSyncInProgress.current = false;
    }
  }, [vaultMetadata, isSyncingVault]);

  return (
    <DiscogsSyncContext.Provider value={{
      releases,
      isSyncing,
      progress,
      totalItems,
      syncedCount,
      vaultMetadata,
      isSyncingVault,
      vaultScannedCount,
      vaultTotalCount,
      startSync,
      syncVaultData
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
