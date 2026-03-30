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
  masterYears: Record<number, number>; // master_id -> original release year
  isSyncingMasters: boolean;
  masterSyncedCount: number;
  masterTotalCount: number;
  user: { username: string } | null;
  startSync: (initialReleases?: DiscogsRelease[], totalCount?: number, force?: boolean) => void;
  syncVaultData: (candidateIds: number[]) => Promise<void>;
  logout: () => void;
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
  const [masterYears, setMasterYears] = useState<Record<number, number>>({});
  const [isSyncingMasters, setIsSyncingMasters] = useState(false);
  const [masterSyncedCount, setMasterSyncedCount] = useState(0);
  const [masterTotalCount, setMasterTotalCount] = useState(0);
  const [user, setUser] = useState<{ username: string } | null>(null);
  
  const syncInProgress = useRef(false);
  const syncCompleted = useRef(false);
  const vaultSyncInProgress = useRef(false);
  const masterSyncInProgress = useRef(false);
  const isInitialized = useRef(false);

  // Constants for localStorage keys
  const STORAGE_KEY_RELEASES = 'vinyl_pulse_releases';
  const STORAGE_KEY_VAULT = 'vinyl_pulse_vault_metadata';
  const STORAGE_KEY_MASTER_YEARS = 'vinyl_pulse_master_years';
  const STORAGE_KEY_USER = 'vinyl_pulse_user';

  // State Recovery on Mount
  React.useEffect(() => {
    if (!isInitialized.current) {
      const savedReleases = localStorage.getItem(STORAGE_KEY_RELEASES);
      const savedVault = localStorage.getItem(STORAGE_KEY_VAULT);
      
      if (savedReleases) {
        try {
          const parsed = JSON.parse(savedReleases);
          setReleases(parsed);
          setSyncedCount(parsed.length);
          console.log(`[Sync] Restored ${parsed.length} releases from storage.`);
        } catch (e) {
          console.error("Failed to restore releases:", e);
        }
      }
      
      if (savedVault) {
        try {
          const parsed = JSON.parse(savedVault);
          setVaultMetadata(parsed);
          setVaultScannedCount(Object.keys(parsed).length);
          console.log(`[Sync] Restored metadata for ${Object.keys(parsed).length} vault items.`);
        } catch (e) {
          console.error("Failed to restore vault metadata:", e);
        }
      }

      const savedMasterYears = localStorage.getItem(STORAGE_KEY_MASTER_YEARS);
      if (savedMasterYears) {
        try {
          const parsed = JSON.parse(savedMasterYears);
          setMasterYears(parsed);
          setMasterSyncedCount(Object.keys(parsed).length);
          console.log(`[Sync] Restored ${Object.keys(parsed).length} master years from storage.`);
        } catch (e) {
          console.error("Failed to restore master years:", e);
        }
      }
      
      // Check Authentication
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          const currentStoredUser = localStorage.getItem(STORAGE_KEY_USER);
          
          if (data.authenticated) {
            const newUser = { username: data.username };
            
            // SESSION TRANSITION: If we switch from Guest to User OR between different Users
            if (currentStoredUser !== data.username) {
              console.log(`[Sync] Session changed (${currentStoredUser || 'Guest'} -> ${data.username}). Resetting local data.`);
              
              // Clear state
              setReleases([]);
              setVaultMetadata({});
              setMasterYears({});
              setSyncedCount(0);
              setVaultScannedCount(0);
              setMasterSyncedCount(0);
              
              // Clear storage
              localStorage.removeItem(STORAGE_KEY_RELEASES);
              localStorage.removeItem(STORAGE_KEY_VAULT);
              localStorage.removeItem(STORAGE_KEY_MASTER_YEARS);
            }
            
            setUser(newUser);
            localStorage.setItem(STORAGE_KEY_USER, data.username);
          } else {
            // SESSION TRANSITION: If we were logged in but now we're not (Logout)
            if (currentStoredUser) {
              console.log(`[Sync] Session ended. Resetting to Guest mode.`);
              setReleases([]);
              setVaultMetadata({});
              setMasterYears({});
              localStorage.removeItem(STORAGE_KEY_RELEASES);
              localStorage.removeItem(STORAGE_KEY_VAULT);
              localStorage.removeItem(STORAGE_KEY_MASTER_YEARS);
              localStorage.removeItem(STORAGE_KEY_USER);
            }
            setUser(null);
          }
        });

      isInitialized.current = true;
    }
  }, []);

  // Automated Persistence
  React.useEffect(() => {
    if (isInitialized.current && releases.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_RELEASES, JSON.stringify(releases));
      } catch (e) {
        console.error("Failed to save releases to localStorage:", e);
      }
    }
  }, [releases]);

  React.useEffect(() => {
    if (isInitialized.current && Object.keys(vaultMetadata).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_VAULT, JSON.stringify(vaultMetadata));
      } catch (e) {
        console.error("Failed to save vault metadata to localStorage:", e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.error("Quota exceeded! We recommend clicking 'Force Refresh' to clean old high-size data.");
        }
      }
    }
  }, [vaultMetadata]);

  React.useEffect(() => {
    if (isInitialized.current && Object.keys(masterYears).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_MASTER_YEARS, JSON.stringify(masterYears));
      } catch (e) {
        console.error("Failed to save master years to localStorage:", e);
      }
    }
  }, [masterYears]);

  // Derive syncedCount and progress from releases state
  React.useEffect(() => {
    setSyncedCount(releases.length);
    if (totalItems > 0) {
      setProgress(Math.min(100, Math.round((releases.length / totalItems) * 100)));
    }
  }, [releases.length, totalItems]);

  const startMasterEnrichment = useCallback(async (releasesToEnrich: DiscogsRelease[], force: boolean = false) => {
    if (masterSyncInProgress.current) return;

    // Collect unique master IDs that we haven't fetched yet (or all if force)
    const uniqueMasterIds = [...new Set(
      releasesToEnrich
        .map(r => r.basic_information.master_id)
        .filter((id): id is number => !!id && id > 0)
    )];

    const toFetch = force
      ? uniqueMasterIds
      : uniqueMasterIds.filter(id => !(id in masterYears));

    if (toFetch.length === 0) {
      console.log('[Masters] All master years already cached.');
      return;
    }

    console.log(`[Masters] Starting enrichment for ${toFetch.length} masters...`);
    masterSyncInProgress.current = true;
    setIsSyncingMasters(true);
    setMasterSyncedCount(0);
    setMasterTotalCount(toFetch.length);

    // No client-side delay needed — the server-side queue in rateLimiter.ts
    // serializes all Discogs API calls at 1200ms intervals per user.
    // We just fire all requests; they'll queue server-side and resolve in order.

    try {
      for (const masterId of toFetch) {
        const res = await fetch(`/api/discogs/master/${masterId}`);

        if (res.ok) {
          const data = await res.json();
          if (data.year) {
            setMasterYears(prev => ({ ...prev, [masterId]: data.year }));
          }
        }
        // Note: 429s should no longer occur since the server queue throttles for us.
        // If they do (e.g. multi-instance), the queue will handle retry implicitly on the next run.

        setMasterSyncedCount(prev => prev + 1);
        // Tiny yield to keep the UI responsive between state updates
        await new Promise(r => setTimeout(r, 10));
      }
    } catch (error) {
      console.error('[Masters] Enrichment error:', error);
    } finally {
      setIsSyncingMasters(false);
      masterSyncInProgress.current = false;
      console.log('[Masters] Enrichment complete.');
    }
  }, [masterYears]);

  const startSync = useCallback(async (initialReleases: DiscogsRelease[] = [], totalCount: number = 0, force: boolean = false) => {
    if ((syncInProgress.current || syncCompleted.current) && !force) return;
    
    syncInProgress.current = true;
    setIsSyncing(true);

    if (force) {
      setReleases([]);
      setSyncedCount(0);
      setProgress(0);
      setVaultMetadata({});
      setVaultScannedCount(0);
      setMasterYears({});
      setMasterSyncedCount(0);
      localStorage.removeItem(STORAGE_KEY_RELEASES);
      localStorage.removeItem(STORAGE_KEY_VAULT);
      localStorage.removeItem(STORAGE_KEY_MASTER_YEARS);
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

    // After collection sync, kick off master year enrichment in the background
    // We read from the ref to get the latest releases without needing it as a dep
    setReleases(currentReleases => {
      // Fire and forget — runs in background after render
      setTimeout(() => startMasterEnrichment(currentReleases, force), 500);
      return currentReleases; // no change, just reading
    });
  }, [totalItems, startMasterEnrichment]);

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
      masterYears,
      isSyncingMasters,
      masterSyncedCount,
      masterTotalCount,
      user,
      startSync,
      syncVaultData,
      logout: () => {
        window.location.href = '/api/auth/logout';
      }
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
