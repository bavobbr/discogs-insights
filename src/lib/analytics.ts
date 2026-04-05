/**
 * Typed GA4 event helpers.
 * All calls are no-ops when gtag isn't loaded (SSR, test environments).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function track(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', eventName, params);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const trackLogout = () => track('logout');

// ─── Collection ───────────────────────────────────────────────────────────────

export const trackCollectionLoadComplete = (totalRecords: number) =>
  track('collection_load_complete', { total_records: totalRecords });

export const trackInfiniteScrollLoad = (visibleCount: number) =>
  track('infinite_scroll_load', { visible_count: visibleCount });

export const trackRecordDetailOpen = (releaseId: number, title: string) =>
  track('record_detail_open', { release_id: releaseId, title });

// ─── Crate Digging ────────────────────────────────────────────────────────────

export const trackCrateDigOpen = (subtitle: string, totalReleases: number) =>
  track('crate_dig_open', { subtitle, total_releases: totalReleases });

export const trackDiscogsLinkClick = (releaseId: number, title: string) =>
  track('discogs_link_click', { release_id: releaseId, title });

// ─── Vault ────────────────────────────────────────────────────────────────────

export const trackVaultScanComplete = (totalScanned: number) =>
  track('vault_scan_complete', { total_scanned: totalScanned });

export const trackVaultRecordOpen = (releaseId: number, title: string, section: string) =>
  track('vault_record_open', { release_id: releaseId, title, section });

// ─── Persona ──────────────────────────────────────────────────────────────────

export const trackPersonaGenerated = (username: string) =>
  track('persona_generated', { username });

export const trackPersonaRefreshed = () => track('persona_refreshed');
