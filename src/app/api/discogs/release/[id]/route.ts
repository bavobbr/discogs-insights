import { NextRequest, NextResponse } from 'next/server';
import { fetchReleaseDetails, DiscogsAuth } from '@/lib/discogs';
import { RateLimitError } from '@/lib/rateLimiter';
import { cookies } from 'next/headers';
import { readReleaseDetails, writeReleaseDetails } from '@/lib/discogsCache';

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
    const cached = await readReleaseDetails(id);
    if (cached) return NextResponse.json(cached);

    const data = await fetchReleaseDetails(id, auth);

    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch from Discogs' }, { status: 500 });
    }

    writeReleaseDetails(id, data).catch(() => {});
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limited', retryAfterMs: error.retryAfterMs },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(error.retryAfterMs / 1000)) } }
      );
    }
    console.error('Release detail API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
