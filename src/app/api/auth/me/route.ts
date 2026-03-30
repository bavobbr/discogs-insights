import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('discogs_session')?.value;

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const { username } = JSON.parse(session);
    return NextResponse.json({ authenticated: true, username });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
