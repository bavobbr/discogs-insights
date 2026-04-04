import { NextRequest, NextResponse } from 'next/server';
import { fetchCollection, DiscogsAuth } from '@/lib/discogs';
import { RateLimitError } from '@/lib/rateLimiter';
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

    const devLimit = process.env.DEV_LIMIT ? parseInt(process.env.DEV_LIMIT, 10) : Infinity;
    if (isFinite(devLimit)) {
      const alreadyFetched = (page - 1) * perPage;
      const remaining = devLimit - alreadyFetched;

      if (remaining <= 0) {
        // Entire limit already satisfied by previous pages — return empty to stop the loop
        return NextResponse.json({
          releases: [],
          pagination: { ...data.pagination, urls: {}, pages: page - 1 },
        });
      }

      if (remaining < data.releases.length) {
        // This page goes over the limit — truncate and signal last page
        return NextResponse.json({
          releases: data.releases.slice(0, remaining),
          pagination: { ...data.pagination, urls: {}, pages: page },
        });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limited', retryAfterMs: error.retryAfterMs },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(error.retryAfterMs / 1000)) } }
      );
    }
    console.error('Sync API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
