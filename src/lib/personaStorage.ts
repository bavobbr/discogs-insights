/**
 * Persona storage abstraction.
 *
 * Production (Vercel):
 *   - JSON data  → Vercel KV   (fast, structured, already configured)
 *   - Image PNGs → Vercel Blob (binary CDN, designed for large files)
 *
 * Local dev (no KV_REST_API_URL / BLOB_READ_WRITE_TOKEN):
 *   - JSON data  → data/persona/{username}.json  (filesystem)
 *   - Image PNGs → public/images/persona/cache/  (served as /images/persona/cache/...)
 *
 * Routes import only from this file — no fs/blob/kv calls in route handlers.
 */

import path from 'path';
import fs from 'fs/promises';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PersonaData {
  title: string;
  description: string;
  microScenes: unknown[];
  signatureRecord?: { artist: string; title: string } | null;
  signatureCover?: string | null;
  malePrompt?: string;
  femalePrompt?: string;
  images: { male: string | null; female: string | null };
  imagesReady: boolean;
  lastGenerated: string;
  cached?: boolean;
  [key: string]: unknown;
}

// ─── Environment detection ─────────────────────────────────────────────────────

const useKv   = !!process.env.KV_REST_API_URL;
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

const KV_PREFIX        = 'persona:';
const BLOB_FOLDER      = 'persona';
const LOCAL_DATA_DIR   = path.join(process.cwd(), 'data/persona');
const LOCAL_IMAGE_DIR  = path.join(process.cwd(), 'public/images/persona/cache');
const LOCAL_IMAGE_PATH = '/images/persona/cache'; // URL path for local images

// ─── JSON (persona data) ──────────────────────────────────────────────────────

export async function readPersonaData(username: string): Promise<PersonaData | null> {
  if (useKv) {
    const { kv } = await import('@vercel/kv');
    return kv.get<PersonaData>(`${KV_PREFIX}${username}`);
  }

  if (useBlob) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: `${BLOB_FOLDER}/${username}.json` });
      const blob = blobs.find(b => b.pathname === `${BLOB_FOLDER}/${username}.json`);
      if (!blob) return null;
      const res = await fetch(blob.url);
      if (!res.ok) return null;
      return await res.json() as PersonaData;
    } catch {
      return null;
    }
  }

  // Filesystem fallback (local dev only)
  try {
    const raw = await fs.readFile(path.join(LOCAL_DATA_DIR, `${username}.json`), 'utf8');
    return JSON.parse(raw) as PersonaData;
  } catch {
    return null;
  }
}

export async function writePersonaData(username: string, data: PersonaData): Promise<void> {
  if (useKv) {
    const { kv } = await import('@vercel/kv');
    // TTL of 7 days — persona regenerates via the 1-hour cooldown anyway
    await kv.set(`${KV_PREFIX}${username}`, data, { ex: 60 * 60 * 24 * 7 });
    return;
  }

  if (useBlob) {
    const { put } = await import('@vercel/blob');
    await put(`${BLOB_FOLDER}/${username}.json`, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  // Filesystem fallback (local dev only)
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(LOCAL_DATA_DIR, `${username}.json`),
    JSON.stringify(data, null, 2)
  );
}

// ─── Images ───────────────────────────────────────────────────────────────────

/**
 * Store a persona image and return its public URL.
 * suffix is 'male' or 'female'.
 */
export async function writePersonaImage(
  username: string,
  suffix: string,
  buffer: Buffer
): Promise<string> {
  const fileName = `${username}_${Date.now()}_${suffix}.png`;

  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`${BLOB_FOLDER}/${fileName}`, buffer, {
      access: 'public',
      contentType: 'image/png',
    });
    return blob.url;
  }

  // Filesystem fallback — served as a static file under /public
  await fs.mkdir(LOCAL_IMAGE_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_IMAGE_DIR, fileName), buffer);
  return `${LOCAL_IMAGE_PATH}/${fileName}`;
}
