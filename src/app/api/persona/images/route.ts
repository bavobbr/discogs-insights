import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { readPersonaData, writePersonaData, writePersonaImage } from '@/lib/personaStorage';

const GEMINI_KEY = process.env.GEMINI_KEY;

export async function POST(request: NextRequest) {
  if (!GEMINI_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    const { username = 'guest' } = await request.json() as { username?: string };

    const existingData = await readPersonaData(username);
    if (!existingData) {
      return NextResponse.json({ error: 'No persona found — generate text persona first' }, { status: 400 });
    }

    const { malePrompt, femalePrompt } = existingData;
    if (!malePrompt || !femalePrompt) {
      return NextResponse.json({ error: 'No prompts found — generate text persona first' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const imageModel = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' });

    const FALLBACK_PROMPTS: Record<string, string> = {
      male:   'Illustrated artistic portrait of a male music lover. Abstract, painterly style. No text.',
      female: 'Illustrated artistic portrait of a female music lover. Abstract, painterly style. No text.',
    };

    const generateImage = async (prompt: string, suffix: string): Promise<string | null> => {
      const attemptGenerate = async (p: string, attempt: number): Promise<{ data: string; mimeType: string } | null> => {
        console.log(`[Gemini:image:${suffix}] attempt ${attempt} → "${p.slice(0, 80)}..."`);
        const t0 = Date.now();
        const result = await imageModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: p }] }],
          // responseModalities is an experimental field not yet in the SDK types
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as any,
        });
        console.log(`[Gemini:image:${suffix}] ← received in ${Date.now() - t0}ms`);

        const parts: Part[] = result.response.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((p): p is Part & { inlineData: { data: string; mimeType: string } } =>
          'inlineData' in p && p.inlineData !== undefined
        );
        if (imagePart) {
          return imagePart.inlineData;
        }

        // Log the refusal text so we can diagnose prompt issues
        const textPart = parts.find((p): p is Part & { text: string } => 'text' in p && typeof p.text === 'string');
        const finishReason = result.response.candidates?.[0]?.finishReason;
        console.warn(`[Gemini:image:${suffix}] no image (attempt ${attempt}). finishReason=${finishReason} text="${textPart?.text?.slice(0, 200)}"`);
        return null;
      };

      try {
        // Attempt 1: use the AI-generated prompt
        let inlineData = await attemptGenerate(prompt, 1);

        // Attempt 2: fall back to a minimal safe prompt
        if (!inlineData) {
          console.warn(`[Gemini:image:${suffix}] retrying with fallback prompt`);
          inlineData = await attemptGenerate(FALLBACK_PROMPTS[suffix] ?? prompt, 2);
        }

        if (!inlineData) return null;

        const buffer = Buffer.from(inlineData.data, 'base64');
        const url = await writePersonaImage(username, suffix, buffer);
        console.log(`[Gemini:image:${suffix}] saved → ${url}`);
        return url;
      } catch (e) {
        console.error(`[Gemini:image:${suffix}] failed:`, e);
        return null;
      }
    };

    console.log(`[Gemini:image] → starting parallel generation for ${username}`);
    const imageT0 = Date.now();
    const [maleUrl, femaleUrl] = await Promise.all([
      generateImage(malePrompt as string, 'male'),
      generateImage(femalePrompt as string, 'female'),
    ]);
    console.log(`[Gemini:image] ← both done in ${Date.now() - imageT0}ms`);

    const updated = { ...existingData, images: { male: maleUrl, female: femaleUrl }, imagesReady: true };
    await writePersonaData(username, updated);

    return NextResponse.json({ images: { male: maleUrl, female: femaleUrl } });

  } catch (error) {
    console.error('Persona Image Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}
