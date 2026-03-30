import { NextRequest, NextResponse } from 'next/server';
import { fetchReleaseDetails } from '@/lib/discogs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid Release ID' }, { status: 400 });
  }

  try {
    const data = await fetchReleaseDetails(id);
    
    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch from Discogs' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Release detail API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
