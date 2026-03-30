import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { fetchCollection, fetchCollectionValue } from '@/lib/discogs';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  // SSR the first page (50 items) and the collection value
  const initialData = await fetchCollection(1, 50);
  const collectionValue = await fetchCollectionValue();

  const initialReleases = initialData?.releases || [];
  const totalItems = initialData?.pagination.items || 0;

  return (
    <>
      <TopAppBar />
      <DashboardClient 
        initialReleases={initialReleases} 
        totalItems={totalItems} 
        collectionValue={collectionValue} 
      />
      <BottomNavBar />
    </>
  );
}
