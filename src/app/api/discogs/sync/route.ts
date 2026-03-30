import { NextRequest, NextResponse } from 'next/server';
import { fetchCollection } from '@/lib/discogs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '50', 10);
  const force = searchParams.get('force') === 'true';

  try {
    const data = await fetchCollection(page, perPage, force);
    
    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch from Discogs' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Sync API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
