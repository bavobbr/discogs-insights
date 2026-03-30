import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { fetchCollection, fetchCollectionValue, DiscogsAuth } from '@/lib/discogs';
import { cookies } from 'next/headers';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('discogs_session')?.value;
  let auth: DiscogsAuth | undefined;

  if (session) {
    try {
      const parsed = JSON.parse(session);
      auth = { 
        token: parsed.token, 
        secret: parsed.secret, 
        username: parsed.username, 
        method: 'oauth' 
      };
    } catch (e) {
      console.error('Failed to parse discogs session cookie:', e);
    }
  }

  // SSR the first page (50 items) and the collection value
  const initialData = await fetchCollection(auth, 1, 50);
  const collectionValue = await fetchCollectionValue(auth);

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
