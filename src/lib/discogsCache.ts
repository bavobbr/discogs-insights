/**
 * Server-side KV cache for Discogs API responses.
 *
 * Collection pages  → guest/default user only, TTL 1h
 * Release details   → all users (global Discogs data), TTL 24h
 * Master years      → all users (immutable), TTL 30d
 *
 * Falls back silently when KV_REST_API_URL is not set (local dev).
 */

import type { CollectionResponse, ReleaseDetails } from './discogs';

const useKv = !!process.env.KV_REST_API_URL;
const DEFAULT_USERNAME = process.env.DISCOGS_USERNAME || 'bavobbr';

/** Returns true if this username is the shared demo/guest user. */
export function isGuestUser(username?: string): boolean {
  return !username || username === DEFAULT_USERNAME || username === 'guest';
}

// ─── Collection (guest only) ──────────────────────────────────────────────────

export async function readCollectionPage(
  username: string,
  page: number,
  perPage: number
): Promise<CollectionResponse | null> {
  if (!useKv) return null;
  const { kv } = await import('@vercel/kv');
  return kv.get<CollectionResponse>(`collection:${username}:p${page}:${perPage}`);
}

export async function writeCollectionPage(
  username: string,
  page: number,
  perPage: number,
  data: CollectionResponse
): Promise<void> {
  if (!useKv) return;
  const { kv } = await import('@vercel/kv');
  await kv.set(`collection:${username}:p${page}:${perPage}`, data, { ex: 86400 * 2 }); // 48h
}

// ─── Release details (all users — community stats, lowest price) ──────────────

export async function readReleaseDetails(id: number): Promise<ReleaseDetails | null> {
  if (!useKv) return null;
  const { kv } = await import('@vercel/kv');
  return kv.get<ReleaseDetails>(`release:${id}`);
}

export async function writeReleaseDetails(id: number, data: ReleaseDetails): Promise<void> {
  if (!useKv) return;
  const { kv } = await import('@vercel/kv');
  await kv.set(`release:${id}`, data, { ex: 86400 }); // 24h
}

// ─── Master years (all users — original release year, immutable) ──────────────

const NO_YEAR_SENTINEL = 0; // stored when Discogs returned no year, to avoid re-fetching

/**
 * Returns the cached year, NO_YEAR_SENTINEL (0) for a confirmed "no year",
 * or null on cache miss.
 */
export async function readMasterYear(id: number): Promise<number | null> {
  if (!useKv) return null;
  const { kv } = await import('@vercel/kv');
  return kv.get<number>(`master:${id}`); // null = miss; 0 = no year; >0 = year
}

export async function writeMasterYear(id: number, year: number | null): Promise<void> {
  if (!useKv) return;
  const { kv } = await import('@vercel/kv');
  await kv.set(`master:${id}`, year ?? NO_YEAR_SENTINEL, { ex: 86400 * 30 }); // 30d
}
