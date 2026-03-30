import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { fetchCollection, DiscogsAuth } from '@/lib/discogs';
import { cookies } from 'next/headers';
import { GenreClient } from './GenreClient';

export default async function GenrePage() {
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

  const initialData = await fetchCollection(auth, 1, 50);

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
