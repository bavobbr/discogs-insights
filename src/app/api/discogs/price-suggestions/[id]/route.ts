import { NextRequest, NextResponse } from 'next/server';
import { fetchPriceSuggestions, DiscogsAuth } from '@/lib/discogs';
import { cookies } from 'next/headers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid Release ID' }, { status: 400 });
  }

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
    const data = await fetchPriceSuggestions(id, auth);
    
    if (!data) {
      // Return 404 or empty object if no suggestions found
      return NextResponse.json({});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Price suggestion API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
