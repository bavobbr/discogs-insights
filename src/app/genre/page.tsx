import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { fetchCollection } from '@/lib/discogs';
import { GenreClient } from './GenreClient';

export default async function GenrePage() {
  const initialData = await fetchCollection(1, 50);

  const initialReleases = initialData?.releases || [];
  const totalItems = initialData?.pagination.items || 0;

  return (
    <>
      <TopAppBar />
      <GenreClient initialReleases={initialReleases} totalItems={totalItems} />
      <BottomNavBar />
    </>
  );
}
