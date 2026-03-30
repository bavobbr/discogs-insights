import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getIdentity } from '@/lib/oauth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const oauthToken = searchParams.get('oauth_token');
  const oauthVerifier = searchParams.get('oauth_verifier');

  if (!oauthToken || !oauthVerifier) {
    return NextResponse.json({ error: 'Missing OAuth parameters' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const oauthTokenSecret = cookieStore.get('discogs_request_token_secret')?.value;

  if (!oauthTokenSecret) {
    return NextResponse.json({ error: 'OAuth session expired or invalid' }, { status: 400 });
  }

  try {
    // 3rd Leg: Exchange request token for access token
    const { oauth_token, oauth_token_secret } = await getAccessToken(oauthToken, oauthTokenSecret, oauthVerifier);

    // Get the user identity (username)
    const identity = await getIdentity(oauth_token, oauth_token_secret);
    const username = identity.username;

    // Securely store the access token, secret, and username in a cookie
    const sessionData = JSON.stringify({
      token: oauth_token,
      secret: oauth_token_secret,
      username,
    });

    // Set permanent session cookie
    cookieStore.set('discogs_session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Clean up request token secret
    cookieStore.delete('discogs_request_token_secret');

    // Redirect to home or vault
    return NextResponse.redirect(new URL('/vault', request.url));
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.json({ error: 'Failed to complete authentication' }, { status: 500 });
  }
}
