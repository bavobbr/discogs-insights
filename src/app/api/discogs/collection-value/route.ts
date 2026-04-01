import { NextResponse } from 'next/server';
import { fetchCollectionValue, DiscogsAuth } from '@/lib/discogs';
import { cookies } from 'next/headers';

export async function GET() {
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
    const data = await fetchCollectionValue(auth);
    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch collection value' }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Collection value API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
