import { NextResponse } from 'next/server';
import { getRequestToken } from '@/lib/oauth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const { oauth_token, oauth_token_secret } = await getRequestToken();

    // Store the request token secret in a cookie for the callback phase
    const cookieStore = await cookies();
    cookieStore.set('discogs_request_token_secret', oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    // Redirect user to Discogs authorization page
    const authorizeUrl = `https://www.discogs.com/oauth/authorize?oauth_token=${oauth_token}`;
    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to initiate login' }, { status: 500 });
  }
}
