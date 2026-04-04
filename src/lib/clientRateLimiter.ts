/**
 * Client-side Discogs request queue.
 *
 * Runs in the browser where module-level state persists for the lifetime of the
 * tab — so a single queue correctly serialises all Discogs API calls regardless
 * of which component or sync loop triggered them (collection, masters, vault).
 *
 * All rate-limited fetch calls in DiscogsSyncContext go through `enqueueDiscogsRequest`.
 * Gemini / auth calls bypass this entirely — they are not Discogs rate-limited.
 */

const MIN_INTERVAL_MS = 1200; // matches server-side guard

interface QueueEntry<T = unknown> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

const queue: QueueEntry[] = [];
let isProcessing = false;
let lastRequestAt = 0;

async function drain(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const entry = queue.shift()!;

    const elapsed = Date.now() - lastRequestAt;
    const waitMs = MIN_INTERVAL_MS - elapsed;
    if (waitMs > 0) {
      await new Promise(r => setTimeout(r, waitMs));
    }

    lastRequestAt = Date.now();

    try {
      const result = await (entry as QueueEntry<unknown>).task();

      // If the server's safety guard fires a 429 (e.g. two tabs open, or borderline timing),
      // wait the suggested delay, update lastRequestAt so the next queued item respects it,
      // then retry once. The retry lives here in drain so lastRequestAt stays consistent.
      if (result instanceof Response && (result as Response).status === 429) {
        let retryAfterMs = MIN_INTERVAL_MS;
        try {
          const body = await (result as Response).clone().json();
          if (body.retryAfterMs) retryAfterMs = body.retryAfterMs;
        } catch { /* ignore parse errors */ }

        await new Promise(r => setTimeout(r, retryAfterMs));
        lastRequestAt = Date.now(); // critical: keep next item from firing immediately after retry

        const retryResult = await (entry as QueueEntry<unknown>).task();
        (entry as QueueEntry<unknown>).resolve(retryResult);
      } else {
        (entry as QueueEntry<unknown>).resolve(result);
      }
    } catch (err) {
      entry.reject(err);
    }
  }

  isProcessing = false;
}

/**
 * Enqueue a rate-limited Discogs API task. Returns a promise that resolves
 * when the task has executed (after waiting its turn in the queue).
 */
export function enqueueDiscogsRequest<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    (queue as QueueEntry<T>[]).push({ task, resolve, reject });
    drain();
  });
}

/** Current queue depth — useful for debugging. */
export function getClientQueueDepth(): number {
  return queue.length;
}
