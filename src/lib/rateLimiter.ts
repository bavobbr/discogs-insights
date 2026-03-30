/**
 * Centralized per-user Discogs API rate limiter & request queue.
 *
 * All routes that call the Discogs API should route through `enqueueDiscogsRequest`.
 * This ensures we never exceed ~50 req/min per user, regardless of how many concurrent
 * Next.js route handlers are running.
 *
 * Module-level state persists across requests within the same Node.js process.
 * In dev and standard prod deployments (single server), this is a true global queue.
 */

const MIN_INTERVAL_MS = 1200; // ~50 req/min, safely under Discogs' 60/min limit

interface QueueEntry<T = unknown> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

// Per-user queues keyed by username (or 'guest' for Personal Access Token users)
const userQueues = new Map<string, QueueEntry[]>();
const activeProcessors = new Set<string>();
const lastRequestAt = new Map<string, number>();

async function drain(userKey: string): Promise<void> {
  // Only one drain loop per user at a time
  if (activeProcessors.has(userKey)) return;
  activeProcessors.add(userKey);

  const queue = userQueues.get(userKey)!;

  while (queue.length > 0) {
    const entry = queue.shift()!;

    // Enforce the minimum interval since the last real request for this user
    const last = lastRequestAt.get(userKey) ?? 0;
    const elapsed = Date.now() - last;
    const waitMs = MIN_INTERVAL_MS - elapsed;
    if (waitMs > 0) {
      await new Promise(r => setTimeout(r, waitMs));
    }

    lastRequestAt.set(userKey, Date.now());

    try {
      const result = await (entry as QueueEntry<unknown>).task();
      (entry as QueueEntry<unknown>).resolve(result);
    } catch (err) {
      entry.reject(err);
    }
  }

  activeProcessors.delete(userKey);
}

/**
 * Enqueue a Discogs API task for a specific user. Returns a promise that resolves
 * when the task has been executed (after waiting its turn in the queue).
 *
 * @param userKey - A stable identifier for the user ('guest' for PAT users, or their username)
 * @param task    - An async function that makes the actual API call and returns data
 */
export function enqueueDiscogsRequest<T>(
  userKey: string,
  task: () => Promise<T>
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (!userQueues.has(userKey)) {
      userQueues.set(userKey, []);
    }

    userQueues.get(userKey)!.push({ task, resolve, reject } as QueueEntry);
    drain(userKey); // kick off the drain loop if not already running
  });
}

/** Returns the current queue depth for a user (useful for debugging). */
export function getQueueDepth(userKey: string): number {
  return userQueues.get(userKey)?.length ?? 0;
}
