import { NextRequest, NextResponse } from 'next/server';
import { fetchMasterYear, DiscogsAuth } from '@/lib/discogs';
import { RateLimitError } from '@/lib/rateLimiter';
import { cookies } from 'next/headers';
import { readMasterYear, writeMasterYear } from '@/lib/discogsCache';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid Master ID' }, { status: 400 });
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
        method: 'oauth',
      };
    } catch {
      // Fall through to PAT auth
    }
  }

  try {
    const cached = await readMasterYear(id);
    if (cached !== null) {
      // 0 is the sentinel for "Discogs has no year for this master"
      return NextResponse.json({ id, year: cached > 0 ? cached : null });
    }

    const year = await fetchMasterYear(id, auth);

    writeMasterYear(id, year).catch(() => {});

    // fetchMasterYear returns null on failure; 404s are normal (no master linked)
    if (year === null) {
      return NextResponse.json({ id, year: null });
    }

    return NextResponse.json({ id, year });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limited', retryAfterMs: error.retryAfterMs },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(error.retryAfterMs / 1000)) } }
      );
    }
    console.error('[Master route] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
