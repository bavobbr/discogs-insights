import { NextRequest, NextResponse } from 'next/server';
import { fetchPriceSuggestions } from '@/lib/discogs';

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
    const data = await fetchPriceSuggestions(id);
    
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
