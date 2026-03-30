import { NextRequest, NextResponse } from 'next/server';
import { fetchCollection, DiscogsAuth } from '@/lib/discogs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '50', 10);
  const force = searchParams.get('force') === 'true';

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

  try {
    const data = await fetchCollection(auth, page, perPage, force);
    
    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch from Discogs' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Sync API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
