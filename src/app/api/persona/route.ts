import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

const GEMINI_KEY = process.env.GEMINI_KEY;
const DATA_DIR = path.join(process.cwd(), 'data/persona');

// Cooldown period: 1 hour in milliseconds
const COOLDOWN_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (!GEMINI_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    const { releases, username: rawUsername } = await request.json();
    const username = rawUsername || process.env.DISCOGS_USERNAME || 'guest';

    if (!releases || !Array.isArray(releases) || releases.length === 0) {
      return NextResponse.json({ error: 'No releases provided' }, { status: 400 });
    }

    await fs.mkdir(DATA_DIR, { recursive: true });
    const userDataPath = path.join(DATA_DIR, `${username}.json`);

    // 1. Check Cooldown — return cached result immediately if fresh enough
    try {
      const existingData = await fs.readFile(userDataPath, 'utf8');
      const parsed = JSON.parse(existingData);
      const now = Date.now();
      const lastGenerated = new Date(parsed.lastGenerated).getTime();

      if (now - lastGenerated < COOLDOWN_MS) {
        console.log(`[Persona] Cooldown active for ${username}. Returning cached result.`);
        return NextResponse.json({ ...parsed, cached: true });
      }
    } catch {
      // No existing data, continue to generation
    }

    // 2. Text Analysis with Gemini (fast phase — returned to client immediately)
    const devLimit = process.env.DEV_LIMIT ? parseInt(process.env.DEV_LIMIT, 10) : Infinity;
    const snapshotCap = Math.min(500, devLimit);
    // Shuffle before slicing so the snapshot is representative across the full collection,
    // not just the most-recently-added records (Discogs default sort order).
    const shuffled = [...releases].sort(() => Math.random() - 0.5);
    const analysisSnapshot = shuffled.slice(0, snapshotCap).map((r: any) => ({
      id: r.id,
      artist: r.basic_information.artists.map((a: any) => a.name).join(', '),
      title: r.basic_information.title,
      genres: r.basic_information.genres,
      styles: r.basic_information.styles,
    }));

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    // thinkingBudget: 0 disables chain-of-thought reasoning — cuts latency from ~25s to ~3s
    // for structured JSON tasks that don't benefit from extended thinking.
    const textModel = genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash' },
      { apiVersion: 'v1beta' }
    );

    const textPrompt = `
      Analyze this record collection metadata.
      Collection Snapshot: ${JSON.stringify(analysisSnapshot)}

      Provide a clinical yet poetic musical persona profile.
      - TONE: Professional Music Critic (Pitchfork/The Wire). Incisive and sharp.
      - STYLE: Avoid "Ah, the...", "You are someone who...", or conversational filler.
      - PERSPECTIVE: Focus on the archetypal "soul" of the collection. Use rhythmic, sophisticated language.

      Return ONLY a JSON object:
      {
        "title": "A precise scene-specific label. Format: 'The [specific genre/era/geography] [concrete noun]'. No subtitles, no colons, no abstract words like 'sonic', 'echoes', 'frequencies', 'journey'. Examples: 'The Kosmische Excavator', 'The Bristol Bass Fundamentalist', 'The Belgische Post-Punk Archivist'.",
        "description": "An incisive editorial review of the musical profile.",
        "microScenes": [
          { "id": 1, "title": "Specific Scene Name", "description": "Analysis", "tags": ["A", "B"], "color": "primary", "signatureRecordId": 12345 }
        ],
        "signatureRecordId": 12345,
        "malePrompt": "Professional photography prompt for a male-adjacent avatar matching this vibe.",
        "femalePrompt": "Professional photography prompt for a female-adjacent avatar matching this vibe."
      }

      For signatureRecordId: the single record that best crystallises the entire persona. Must be an id from the collection snapshot.
      For each microScene's signatureRecordId: the record that best represents that specific sub-scene. Must be an id from the collection snapshot. Each scene should have a different record.
    `;

    console.log(`[Gemini:text] → sending prompt for ${username} (${analysisSnapshot.length} releases, cap=${snapshotCap})`);
    const textT0 = Date.now();
    const textResult = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: textPrompt }] }],
      generationConfig: { thinkingConfig: { thinkingBudget: 1500 } } as any,
    });
    console.log(`[Gemini:text] ← received in ${Date.now() - textT0}ms`);
    const textData = JSON.parse(textResult.response.text().match(/\{[\s\S]*\}/)![0]);

    // Build a lookup map for O(1) resolution
    const releaseById = new Map(releases.map((r: any) => [r.id, r]));

    const resolveRecord = (id: number) => {
      const match = releaseById.get(id);
      if (!match) return null;
      return {
        artist: match.basic_information.artists.map((a: any) => a.name).join(', '),
        title: match.basic_information.title,
        cover: match.basic_information.cover_image ?? null,
      };
    };

    const signatureResolved = resolveRecord(textData.signatureRecordId);
    const signatureRecord = signatureResolved ? { artist: signatureResolved.artist, title: signatureResolved.title } : null;
    const signatureCover = signatureResolved?.cover ?? null;

    // Resolve per-scene signature records
    const microScenes = (textData.microScenes ?? []).map((scene: any) => {
      const resolved = resolveRecord(scene.signatureRecordId);
      return {
        ...scene,
        signatureRecord: resolved ? { artist: resolved.artist, title: resolved.title } : null,
        signatureCover: resolved?.cover ?? null,
      };
    });

    const partialPersona = {
      ...textData,
      microScenes,
      signatureRecord,
      signatureCover,
      images: { male: null, female: null },
      imagesReady: false,
      lastGenerated: new Date().toISOString(),
    };

    // Save partial result so the images endpoint can read the prompts
    await fs.writeFile(userDataPath, JSON.stringify(partialPersona, null, 2));

    return NextResponse.json(partialPersona);

  } catch (error) {
    console.error('Persona Text Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate persona' }, { status: 500 });
  }
}
