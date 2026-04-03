import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { ArtistClient } from './ArtistClient';

export const metadata = {
  title: 'Top Artists | Vinyl Pulse',
  description: 'Deep insights into your most collected artists.',
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
