import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { fetchCollection } from '@/lib/discogs';
import { VaultClient } from './VaultClient';

export const metadata = {
  title: 'The Vault | Vinyl Pulse',
  description: 'A high-fidelity showcase of your most coveted, rare, and personal masterpieces.',
};

export default async function VaultPage() {
  const initialData = await fetchCollection(1, 50);

  const initialReleases = initialData?.releases || [];

  return (
    <>
      <TopAppBar />
      <VaultClient initialReleases={initialReleases} />
      <BottomNavBar />
    </>
  );
}
