/**
 * Server-side Discogs rate-limit guard.
 *
 * In production (Vercel serverless), module-level state does NOT persist across
 * invocations — each function instance is isolated. We use Vercel KV (Redis) to
 * share the last-request timestamp across instances.
 *
 * In local development (`next dev` is a persistent Node process), we fall back to
 * an in-memory Map — which works correctly because the process never restarts.
 *
 * This is a FAST-FAIL guard, not a queue. It never sleeps. The client owns pacing
 * (see clientRateLimiter.ts). If called too soon, it throws RateLimitError and the
 * route returns 429 — the client handles the retry.
 */

import { kv } from '@vercel/kv';

const MIN_INTERVAL_MS = 1200;
// 300ms grace: accounts for setTimeout imprecision (~50-100ms) and Next.js dev-mode
// module re-initialization across lazy-compiled routes. Server threshold = 900ms,
// which is safely under Discogs's actual 1000ms (60 req/min) limit.
const GRACE_MS = 300;
const KV_TTL_SECONDS = 10; // auto-expire stale keys

const isKvAvailable = !!process.env.KV_REST_API_URL;

// Use globalThis so the Map survives Next.js hot-module re-initialization in dev.
// Each route compiles separately and would otherwise get a fresh module instance.
const g = globalThis as typeof globalThis & {
  _rateLimiterLastRequestAt?: Map<string, number>;
};
if (!g._rateLimiterLastRequestAt) {
  g._rateLimiterLastRequestAt = new Map<string, number>();
}
const localLastRequestAt = g._rateLimiterLastRequestAt;

export class RateLimitError extends Error {
  constructor(public readonly retryAfterMs: number) {
    super(`Rate limited — retry after ${retryAfterMs}ms`);
    this.name = 'RateLimitError';
  }
}

async function getLastRequestAt(userKey: string): Promise<number | null> {
  if (isKvAvailable) {
    return kv.get<number>(`discogs:lastRequest:${userKey}`);
  }
  return localLastRequestAt.get(userKey) ?? null;
}

async function setLastRequestAt(userKey: string, timestamp: number): Promise<void> {
  if (isKvAvailable) {
    await kv.set(`discogs:lastRequest:${userKey}`, timestamp, { ex: KV_TTL_SECONDS });
  } else {
    localLastRequestAt.set(userKey, timestamp);
  }
}

/**
 * Check the rate limit for a user and execute the task if allowed.
 * Throws RateLimitError immediately if called too soon — never sleeps.
 */
export async function enqueueDiscogsRequest<T>(
  userKey: string,
  task: () => Promise<T>
): Promise<T> {
  const lastAt = await getLastRequestAt(userKey);

  if (lastAt !== null) {
    const elapsed = Date.now() - lastAt;
    if (elapsed < MIN_INTERVAL_MS - GRACE_MS) {
      throw new RateLimitError(MIN_INTERVAL_MS - elapsed);
    }
  }

  await setLastRequestAt(userKey, Date.now());
  return task();
}

/** Returns current queue depth — always 0 now, kept for API compatibility. */
export function getQueueDepth(_userKey: string): number {
  return 0;
}
