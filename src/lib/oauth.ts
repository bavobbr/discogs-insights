const CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET;
const CALLBACK_URL = process.env.DISCOGS_CALLBACK_URL || 'http://localhost:3000/api/auth/callback';

function validateConfig() {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error('Missing DISCOGS_CONSUMER_KEY or DISCOGS_CONSUMER_SECRET in environment variables.');
  }
}

export interface OAuthSession {
  oauth_token: string;
  oauth_token_secret: string;
}

export interface AccessTokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
}

export async function getRequestToken(): Promise<OAuthSession> {
  validateConfig();
  const nonce = Math.random().toString(36).substring(2);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const authHeader = [
    `OAuth oauth_consumer_key="${CONSUMER_KEY}"`,
    `oauth_nonce="${nonce}"`,
    `oauth_signature="${CONSUMER_SECRET}&"`,
    `oauth_signature_method="PLAINTEXT"`,
    `oauth_timestamp="${timestamp}"`,
    `oauth_callback="${encodeURIComponent(CALLBACK_URL)}"`
  ].join(', ');

  const res = await fetch('https://api.discogs.com/oauth/request_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authHeader,
      'User-Agent': 'VinylPulse/1.0',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get request token: ${text}`);
  }

  const body = await res.text();
  const params = new URLSearchParams(body);
  return {
    oauth_token: params.get('oauth_token')!,
    oauth_token_secret: params.get('oauth_token_secret')!,
  };
}

export async function getAccessToken(oauthToken: string, oauthTokenSecret: string, oauthVerifier: string): Promise<AccessTokenResponse> {
  validateConfig();
  const nonce = Math.random().toString(36).substring(2);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const authHeader = [
    `OAuth oauth_consumer_key="${CONSUMER_KEY}"`,
    `oauth_nonce="${nonce}"`,
    `oauth_signature="${CONSUMER_SECRET}&${oauthTokenSecret}"`,
    `oauth_signature_method="PLAINTEXT"`,
    `oauth_timestamp="${timestamp}"`,
    `oauth_token="${oauthToken}"`,
    `oauth_verifier="${oauthVerifier}"`
  ].join(', ');

  const res = await fetch('https://api.discogs.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authHeader,
      'User-Agent': 'VinylPulse/1.0',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get access token: ${text}`);
  }

  const body = await res.text();
  const params = new URLSearchParams(body);
  return {
    oauth_token: params.get('oauth_token')!,
    oauth_token_secret: params.get('oauth_token_secret')!,
  };
}

export async function getIdentity(token: string, secret: string) {
  validateConfig();
  const nonce = Math.random().toString(36).substring(2);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const authHeader = [
    `OAuth oauth_consumer_key="${CONSUMER_KEY}"`,
    `oauth_nonce="${nonce}"`,
    `oauth_signature="${CONSUMER_SECRET}&${secret}"`,
    `oauth_signature_method="PLAINTEXT"`,
    `oauth_timestamp="${timestamp}"`,
    `oauth_token="${token}"`
  ].join(', ');

  const res = await fetch('https://api.discogs.com/oauth/identity', {
    headers: {
      'Authorization': authHeader,
      'User-Agent': 'VinylPulse/1.0',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to get identity');
  }

  return res.json();
}

/**
 * Generates the Authorization header for subsequent API calls
 */
export function getOAuthHeader(token: string, secret: string): string {
    const nonce = Math.random().toString(36).substring(2);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    return [
      `OAuth oauth_consumer_key="${CONSUMER_KEY}"`,
      `oauth_nonce="${nonce}"`,
      `oauth_signature="${CONSUMER_SECRET}&${secret}"`,
      `oauth_signature_method="PLAINTEXT"`,
      `oauth_timestamp="${timestamp}"`,
      `oauth_token="${token}"`,
      `oauth_version="1.0"`
    ].join(', ');
}
