import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readPersonaData, writePersonaData, writePersonaImage } from '@/lib/personaStorage';

const GEMINI_KEY = process.env.GEMINI_KEY;

export async function POST(request: NextRequest) {
  if (!GEMINI_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    const { username = 'guest' } = await request.json();

    const existingData = await readPersonaData(username);
    if (!existingData) {
      return NextResponse.json({ error: 'No persona found — generate text persona first' }, { status: 400 });
    }

    const { malePrompt, femalePrompt } = existingData;
    if (!malePrompt || !femalePrompt) {
      return NextResponse.json({ error: 'No prompts found — generate text persona first' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    // gemini-2.0-flash-exp-image-generation supports inline image output
    const imageModel = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' });

    const generateImage = async (prompt: string, suffix: string): Promise<string | null> => {
      console.log(`[Gemini:image:${suffix}] → sending prompt for ${username}: "${prompt.slice(0, 80)}..."`);
      const t0 = Date.now();
      try {
        const result = await imageModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as any,
        });
        console.log(`[Gemini:image:${suffix}] ← received in ${Date.now() - t0}ms`);
        const imagePart = result.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

        if (imagePart?.inlineData) {
          const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
          const url = await writePersonaImage(username, suffix, buffer);
          console.log(`[Gemini:image:${suffix}] saved → ${url}`);
          return url;
        }
        console.warn(`[Gemini:image:${suffix}] no image part in response`);
        return null;
      } catch (e) {
        console.error(`[Gemini:image:${suffix}] failed after ${Date.now() - t0}ms:`, e);
        return null;
      }
    };

    console.log(`[Gemini:image] → starting parallel generation for ${username}`);
    const imageT0 = Date.now();
    const [maleUrl, femaleUrl] = await Promise.all([
      generateImage(malePrompt, 'male'),
      generateImage(femalePrompt, 'female'),
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
