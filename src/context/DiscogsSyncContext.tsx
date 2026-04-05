"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { DiscogsRelease, ReleaseDetails, CollectionValue } from '@/lib/discogs';
import { enqueueDiscogsRequest } from '@/lib/clientRateLimiter';

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
  isAuthReady: boolean;
  collectionValue: CollectionValue | null;
  startSync: (initialReleases?: DiscogsRelease[], totalCount?: number, force?: boolean) => void;
  syncVaultData: (candidateIds: number[]) => Promise<void>;
  logout: () => void;
}

const DiscogsSyncContext = createContext<DiscogsSyncContextType | undefined>(undefined);

export function DiscogsSyncProvider({ children }: { children: React.ReactNode }) {
  const [releases, setReleases] = useState<DiscogsRelease[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [vaultMetadata, setVaultMetadata] = useState<Record<number, ReleaseDetails>>({});
  // Mirror for skip-check in syncVaultData without closure staleness
  const setVaultMetadataAndRef = React.useCallback((updater: (prev: Record<number, ReleaseDetails>) => Record<number, ReleaseDetails>) => {
    setVaultMetadata(prev => {
      const next = updater(prev);
      vaultMetadataRef.current = next;
      return next;
    });
  }, []);
  const [isSyncingVault, setIsSyncingVault] = useState(false);
  const [vaultScannedCount, setVaultScannedCount] = useState(0);
  const [vaultTotalCount, setVaultTotalCount] = useState(0);
  const [masterYears, setMasterYears] = useState<Record<number, number>>({});
  const [isSyncingMasters, setIsSyncingMasters] = useState(false);
  const [masterSyncedCount, setMasterSyncedCount] = useState(0);
  const [masterTotalCount, setMasterTotalCount] = useState(0);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [collectionValue, setCollectionValue] = useState<CollectionValue | null>(null);
  
  const syncInProgress = useRef(false);
  const syncCompleted = useRef(false);
  const vaultSyncInProgress = useRef(false);
  const masterSyncInProgress = useRef(false);
  const isInitialized = useRef(false);
  const vaultMetadataRef = useRef<Record<number, ReleaseDetails>>({});
  const masterYearsRef = useRef<Record<number, number>>({});

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
          console.log(`[Sync] Restored ${parsed.length} releases from storage.`);
        } catch (e) {
          console.error("Failed to restore releases:", e);
        }
      }
      
      if (savedVault) {
        try {
          const parsed = JSON.parse(savedVault);
          vaultMetadataRef.current = parsed;
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
          masterYearsRef.current = parsed;
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

          // Fetch collection value in background — works with both OAuth and PAT fallback
          enqueueDiscogsRequest(() => fetch('/api/discogs/collection-value'))
            .then(res => res.ok ? res.json() : null)
            .then(val => { if (val) setCollectionValue(val); })
            .catch(() => {});

          setIsAuthReady(true);
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
    masterYearsRef.current = masterYears;
    if (isInitialized.current && Object.keys(masterYears).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_MASTER_YEARS, JSON.stringify(masterYears));
      } catch (e) {
        console.error("Failed to save master years to localStorage:", e);
      }
    }
  }, [masterYears]);

  // Derived values — no extra setState, no cascading re-renders
  const syncedCount = releases.length;
  const progress = isSyncing && totalItems > 0
    ? Math.min(100, Math.round((releases.length / totalItems) * 100))
    : !isSyncing && releases.length > 0 ? 100 : 0;

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
      : uniqueMasterIds.filter(id => !(id in masterYearsRef.current));

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

    const BATCH_SIZE = 5;
    try {
      let batch: Record<number, number> = {};
      let batchCount = 0;

      for (const masterId of toFetch) {
        const res = await enqueueDiscogsRequest(() => fetch(`/api/discogs/master/${masterId}`));
        if (res.ok) {
          const data = await res.json();
          if (data.year) {
            batch[masterId] = data.year;
          }
        }
        batchCount++;

        if (batchCount >= BATCH_SIZE) {
          const captured = batch;
          const count = batchCount;
          setMasterYears(prev => ({ ...prev, ...captured }));
          setMasterSyncedCount(prev => prev + count);
          batch = {};
          batchCount = 0;
        }
      }

      // Flush remaining
      if (batchCount > 0) {
        setMasterYears(prev => ({ ...prev, ...batch }));
        setMasterSyncedCount(prev => prev + batchCount);
      }
    } catch (error) {
      console.error('[Masters] Enrichment error:', error);
    } finally {
      setIsSyncingMasters(false);
      masterSyncInProgress.current = false;
      console.log('[Masters] Enrichment complete.');
    }
  }, []);

  const startSync = useCallback(async (initialReleases: DiscogsRelease[] = [], totalCount: number = 0, force: boolean = false) => {
    if ((syncInProgress.current || syncCompleted.current) && !force) return;
    
    syncInProgress.current = true;
    setIsSyncing(true);

    if (force) {
      setReleases([]);
      vaultMetadataRef.current = {};
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

    // Track all releases locally so master enrichment always gets the complete set,
    // even if React hasn't flushed all setReleases calls yet.
    const seenIds = new Set(initialReleases.map(r => r.id));
    const allReleases: DiscogsRelease[] = [...initialReleases];
    let syncedSuccessfully = false;

    try {
      let currentPage = 1;
      const perPage = 50;
      let hasNext = true;

      // If we have initial releases, start from page 2 unless we are forcing
      if (initialReleases.length > 0 && !force) {
        currentPage = 2;
      }

      while (hasNext) {
        const res = await enqueueDiscogsRequest(() => fetch(`/api/discogs/sync?page=${currentPage}&per_page=${perPage}${force ? '&force=true' : ''}`));
        if (!res.ok) break;

        const data = await res.json();
        const incomingReleases = data.releases as DiscogsRelease[];

        if (incomingReleases.length === 0) {
          hasNext = false;
          break;
        }

        const newItems = incomingReleases.filter(r => !seenIds.has(r.id));
        newItems.forEach(r => seenIds.add(r.id));
        allReleases.push(...newItems);

        setReleases(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          return [...prev, ...incomingReleases.filter(r => !existingIds.has(r.id))];
        });

        // Update total items if provided in pagination
        if (data.pagination.items > totalItems) {
          setTotalItems(data.pagination.items);
        }

        if (!data.pagination.urls.next || currentPage >= data.pagination.pages) {
          hasNext = false;
          syncedSuccessfully = true;
        } else {
          currentPage++;
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
      syncCompleted.current = true;
    }

    // Only kick off master enrichment if we have a complete dataset.
    // Using allReleases (local accumulator) avoids the setReleases-as-reader hack
    // and ensures we never enrich against partial data from a failed/interrupted sync.
    if (syncedSuccessfully) {
      console.log(`[Masters] Sync complete (${allReleases.length} releases). Starting enrichment...`);
      setTimeout(() => startMasterEnrichment(allReleases, force), 500);
    } else {
      console.warn(`[Masters] Sync did not complete cleanly — skipping master enrichment to avoid partial data.`);
    }
  }, [totalItems, startMasterEnrichment]);

  const syncVaultData = useCallback(async (candidateIds: number[]) => {
    if (vaultSyncInProgress.current) return;
    vaultSyncInProgress.current = true;
    setIsSyncingVault(true);
    setVaultScannedCount(0);
    setVaultTotalCount(candidateIds.length);

    const BATCH_SIZE = 5;
    try {
      let batch: Record<number, ReleaseDetails> = {};
      let batchCount = 0;
      let scannedCount = 0;

      for (const id of candidateIds) {
        scannedCount++;

        if (!vaultMetadataRef.current[id]) {
          const res = await enqueueDiscogsRequest(() => fetch(`/api/discogs/release/${id}`));
          if (res.ok) {
            const details = await res.json();
            batch[id] = details;
            batchCount++;
          }
        }

        if (batchCount >= BATCH_SIZE || (scannedCount % BATCH_SIZE === 0)) {
          if (batchCount > 0) {
            const captured = batch;
            setVaultMetadataAndRef(prev => ({ ...prev, ...captured }));
            batch = {};
            batchCount = 0;
          }
          setVaultScannedCount(scannedCount);
        }
      }

      // Flush remaining
      if (batchCount > 0) {
        setVaultMetadataAndRef(prev => ({ ...prev, ...batch }));
      }
      setVaultScannedCount(scannedCount);
    } catch (error) {
      console.error("Vault sync error:", error);
    } finally {
      setIsSyncingVault(false);
      vaultSyncInProgress.current = false;
    }
  }, [setVaultMetadataAndRef]);

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
      isAuthReady,
      collectionValue,
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
