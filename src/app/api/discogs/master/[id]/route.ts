import { NextRequest, NextResponse } from 'next/server';
import { fetchMasterYear, DiscogsAuth } from '@/lib/discogs';
import { cookies } from 'next/headers';

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
    const year = await fetchMasterYear(id, auth);

    // fetchMasterYear returns null on failure; 404s are normal (no master linked)
    if (year === null) {
      return NextResponse.json({ id, year: null });
    }

    return NextResponse.json({ id, year });
  } catch (error) {
    console.error('[Master route] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
