import { Metadata } from 'next';
import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { ArtistClient } from './ArtistClient';

export const metadata: Metadata = {
  title: 'Top Artists | Vinyl Pulse',
  description: 'Deep insights into your most collected artists.',
  openGraph: {
    title: 'Top Artists | Vinyl Pulse',
    description: 'Deep insights into your most collected artists.',
    url: 'https://vinyl-pulse.app/artists',
    images: [{ url: '/api/og?type=artists&title=Top+Artists&description=Deep+insights+into+your+most+collected+artists.', width: 1200, height: 630 }],
  },
  twitter: {
    title: 'Top Artists | Vinyl Pulse',
    description: 'Deep insights into your most collected artists.',
    images: ['/api/og?type=artists&title=Top+Artists&description=Deep+insights+into+your+most+collected+artists.'],
  },
};

export default function ArtistsPage() {
  return (
    <main className="min-h-screen bg-surface">
      <TopAppBar />
      <ArtistClient />
      <BottomNavBar />
    </main>
  );
}
