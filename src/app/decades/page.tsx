import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { fetchCollection } from '@/lib/discogs';
import { DecadesClient } from './DecadesClient';

export default async function DecadesPage() {
  const initialData = await fetchCollection(1, 50);

  const initialReleases = initialData?.releases || [];
  const totalItems = initialData?.pagination.items || 0;

  return (
    <>
      <TopAppBar />
      <DecadesClient initialReleases={initialReleases} totalItems={totalItems} />
      <BottomNavBar />
    </>
  );
}
