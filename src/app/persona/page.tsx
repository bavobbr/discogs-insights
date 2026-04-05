import PersonaClient from './PersonaClient';
import { Metadata } from 'next';
import { readPersonaData } from '@/lib/personaStorage';

const BASE = 'https://vinyl-pulse.app';

export async function generateMetadata(): Promise<Metadata> {
  const defaultUsername = process.env.DISCOGS_USERNAME || 'bavobbr';
  const persona = await readPersonaData(defaultUsername).catch(() => null);

  const title    = persona?.title    ? `${persona.title} | Vinyl Pulse` : 'Sonic Persona | Vinyl Pulse';
  const description = persona?.description
    ? (persona.description as string).slice(0, 160)
    : 'AI-driven musical identity analysis based on your Discogs collection.';

  const image = persona?.images?.male || persona?.images?.female || null;

  const ogImageParams = new URLSearchParams({
    type: 'persona',
    title: persona?.title || 'Sonic Persona',
    description,
    ...(image ? { image: image as string } : {}),
  });

  const ogImageUrl = `/api/og?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/persona`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: persona?.title || 'Sonic Persona' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function PersonaPage() {
  return <PersonaClient />;
}
