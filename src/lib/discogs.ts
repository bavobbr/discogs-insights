import { getOAuthHeader } from './oauth';
import { enqueueDiscogsRequest } from './rateLimiter';

export interface DiscogsAuth {
  token: string;
  secret?: string;
  username?: string;
  method: 'pat' | 'oauth';
}

export interface DiscogsRelease {
  id: number;
  instance_id: number;
  date_added: string;
  rating: number;
  basic_information: {
    id: number;
    master_id: number;
    master_url: string;
    resource_url: string;
    thumb: string;
    cover_image: string;
    title: string;
    year: number;
    formats: Array<{
      name: string;
      qty: string;
      text?: string;
      descriptions?: string[];
    }>;
    labels: Array<{
      name: string;
      catno: string;
      entity_type: string;
      entity_type_name: string;
      id: number;
      resource_url: string;
    }>;
    artists: Array<{
      name: string;
      anv: string;
      join: string;
      role: string;
      tracks: string;
      id: number;
      resource_url: string;
    }>;
    genres: string[];
    styles: string[];
  };
}

export interface PriceSuggestions {
  [condition: string]: {
    currency: string;
    value: number;
  };
}

export interface ReleaseDetails {
  id: number;
  community: {
    have: number;
    want: number;
    rating: {
      count: number;
      average: number;
    };
  };
  lowest_price: number | null;
  country: string;
}

export interface CollectionResponse {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
    urls: {
      last?: string;
      next?: string;
    };
  };
  releases: DiscogsRelease[];
}

const DEFAULT_USERNAME = process.env.DISCOGS_USERNAME || 'bavobbr';
const API_URL = 'https://api.discogs.com';

function getAuthHeaders(auth?: DiscogsAuth) {
  const method = auth?.method || 'pat';
  const token = auth?.token || process.env.DISCOGS_PAT;

  if (method === 'pat') {
    return {
      'Authorization': `Discogs token=${token}`,
      'User-Agent': 'VinylPulse/1.0 +github.com/bavobbr',
    };
  }

  // OAuth 1.0a header generation using utility
  return {
     'Authorization': getOAuthHeader(token!, auth!.secret!),
     'User-Agent': 'VinylPulse/1.0 +github.com/bavobbr',
  };
}

function getUsername(auth?: DiscogsAuth) {
  return auth?.username || DEFAULT_USERNAME;
}

/** Stable key used to identify which per-user queue to use. */
export function getUserKey(auth?: DiscogsAuth): string {
  return auth?.username || DEFAULT_USERNAME || 'guest';
}

export async function fetchCollection(auth?: DiscogsAuth, page: number = 1, perPage: number = 100, force: boolean = false): Promise<CollectionResponse | null> {
  const username = getUsername(auth);
  const headers = getAuthHeaders(auth);
  const userKey = getUserKey(auth);
  
  if (!headers.Authorization) {
    console.error("Missing authentication credentials.");
    return null;
  }

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
    headers,
  };

  if (force) {
    fetchOptions.cache = 'no-store';
  } else {
    fetchOptions.next = { revalidate: 3600 };
  }

  return enqueueDiscogsRequest(userKey, async () => {
    const res = await fetch(`${API_URL}/users/${username}/collection/folders/0/releases?page=${page}&per_page=${perPage}`, fetchOptions);
    if (!res.ok) {
      console.error(`Failed to fetch collection from Discogs: ${res.statusText}`);
      return null;
    }
    return res.json();
  });
}

/**
 * Aggregates all user releases, handling pagination. Can be limited by DEV_LIMIT.
 */
export async function fetchAllUserReleases(auth?: DiscogsAuth): Promise<DiscogsRelease[]> {
  const devLimit = process.env.DEV_LIMIT ? parseInt(process.env.DEV_LIMIT, 10) : Infinity;
  let allReleases: DiscogsRelease[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const data = await fetchCollection(auth, page, perPage);
    if (!data) break;

    allReleases = allReleases.concat(data.releases);

    if (allReleases.length >= devLimit) {
      allReleases = allReleases.slice(0, devLimit);
      break;
    }

    if (!data.pagination.urls.next || page >= data.pagination.pages) {
      break;
    }

    // Rate Limit Safety (Basic) - 60 per minute = 1 per second average. Let's do a 1.2s delay if we need multiple pages
    await new Promise(resolve => setTimeout(resolve, 1200));
    page++;
  }

  return allReleases;
}

/**
 * Fetches extended metadata for a specific release to get community stats and pricing.
 */
export async function fetchReleaseDetails(id: number, auth?: DiscogsAuth): Promise<ReleaseDetails | null> {
  const headers = getAuthHeaders(auth);
  const userKey = getUserKey(auth);
  if (!headers.Authorization) return null;

  return enqueueDiscogsRequest(userKey, async () => {
    const res = await fetch(`${API_URL}/releases/${id}`, {
      headers,
      next: { revalidate: 86400 } // Cache for 24h
    });

    if (!res.ok) {
      console.warn(`Failed to fetch release ${id}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const scrubbed: ReleaseDetails = {
      id: data.id,
      lowest_price: data.lowest_price,
      country: data.country || "Unknown",
      community: {
        have: data.community?.have || 0,
        want: data.community?.want || 0,
        rating: {
          count: data.community?.rating?.count || 0,
          average: data.community?.rating?.average || 0
        }
      }
    };
    return scrubbed;
  });
}

/**
 * Fetches the original release year for a master release.
 * Results should be cached aggressively — original years never change.
 */
export async function fetchMasterYear(masterId: number, auth?: DiscogsAuth): Promise<number | null> {
  const headers = getAuthHeaders(auth);
  const userKey = getUserKey(auth);
  if (!headers.Authorization) return null;

  return enqueueDiscogsRequest(userKey, async () => {
    const res = await fetch(`${API_URL}/masters/${masterId}`, {
      headers,
      next: { revalidate: 86400 * 30 }, // Cache for 30 days — originals never change
    });

    if (!res.ok) {
      if (res.status !== 404) {
        console.warn(`[Discogs] Failed to fetch master ${masterId}: ${res.status} ${res.statusText}`);
      }
      return null;
    }

    const data = await res.json();
    return data.year ?? null;
  });
}

/**
 * Fetches price suggestions based on marketplace history for different conditions.
 */
export async function fetchPriceSuggestions(id: number, auth?: DiscogsAuth): Promise<PriceSuggestions | null> {
  const headers = getAuthHeaders(auth);
  const userKey = getUserKey(auth);
  if (!headers.Authorization) return null;

  return enqueueDiscogsRequest(userKey, async () => {
    try {
      const res = await fetch(`${API_URL}/marketplace/price_suggestions/${id}`, {
        headers,
        cache: 'no-store'
      });

      if (!res.ok) {
        if (res.status === 404) return null;
        console.warn(`Failed to fetch price suggestions for ${id}: ${res.statusText}`);
        return null;
      }

      const data = await res.json();
      console.log(`[Discogs API] Price suggestions for ${id}:`, Object.keys(data));
      return data;
    } catch (error) {
      console.error('Price suggestions fetch error:', error);
      return null;
    }
  });
}

/**
 * Heuristically identifies potential "Vault" items from a collection
 * based on user ratings and physical format descriptions.
 */
export function identifyVaultCandidates(releases: DiscogsRelease[]): DiscogsRelease[] {
  return [...releases]
    .filter(r => {
      const isFiveStar = r.rating === 5;
      const isSpecialFormat = r.basic_information.formats?.some(f => 
        f.descriptions?.some(d => 
          ["Limited Edition", "Numbered", "Box Set", "Special Edition", "Promo", "White Label"].includes(d)
        )
      );
      return isFiveStar || isSpecialFormat;
    })
    .sort((a, b) => {
      // Prioritize 5-star items, then by year (older might be rarer)
      if (b.rating !== a.rating) return b.rating - a.rating;
      return (a.basic_information.year || 0) - (b.basic_information.year || 0);
    })
    .slice(0, 40); // Rate limit safety buffer
}

// masterYears: map of master_id -> original release year, fetched via /masters/{id}
export function analyzeDecades(releases: DiscogsRelease[], masterYears: Record<number, number> = {}) {
  const decades: Record<string, { count: number; images: string[]; releases: DiscogsRelease[] }> = {
    '1950s': { count: 0, images: [], releases: [] },
    '1960s': { count: 0, images: [], releases: [] },
    '1970s': { count: 0, images: [], releases: [] },
    '1980s': { count: 0, images: [], releases: [] },
    '1990s': { count: 0, images: [], releases: [] },
    '2000s': { count: 0, images: [], releases: [] },
    '2010s': { count: 0, images: [], releases: [] },
    '2020s': { count: 0, images: [], releases: [] },
  };

  let totalMapped = 0;

  for (const r of releases) {
    const masterId = r.basic_information.master_id;
    // Prefer original year from master record; fall back to pressing year
    const year = (masterId && masterId > 0 && masterYears[masterId]) || r.basic_information.year;
    if (!year || year === 0) continue; // Unknown
    const cover = r.basic_information.cover_image;

    let target = '';
    if (year >= 1950 && year < 1960) target = '1950s';
    else if (year >= 1960 && year < 1970) target = '1960s';
    else if (year >= 1970 && year < 1980) target = '1970s';
    else if (year >= 1980 && year < 1990) target = '1980s';
    else if (year >= 1990 && year < 2000) target = '1990s';
    else if (year >= 2000 && year < 2010) target = '2000s';
    else if (year >= 2010 && year < 2020) target = '2010s';
    else if (year >= 2020) target = '2020s';

    if (target) {
      decades[target].count++;
      decades[target].releases.push(r);
      
      // A valid image must exist, start with http, and not contain known Discogs generic placeholder IDs
      const isValidImage = cover && cover.startsWith('http') && !cover.includes('spacer.gif') && !cover.includes('default-') && !cover.includes('/images/default_');
      
      if (isValidImage && decades[target].images.length < 9) {
        decades[target].images.push(cover);
      }
      totalMapped++;
    }
  }

  // Find Peak Decade
  let peakDecade = '1970s';
  let maxCount = 0;
  for (const [decade, data] of Object.entries(decades)) {
    if (data.count > maxCount) {
      maxCount = data.count;
      peakDecade = decade;
    }
  }

  return { decadeData: decades, totalMapped, peakDecade };
}

export interface GenreStyleData {
  name: string;
  count: number;
  color: string;
  styles: { name: string, count: number, releases: DiscogsRelease[] }[];
}

export function analyzeGenres(releases: DiscogsRelease[]): GenreStyleData[] {
  const genreMeta: Record<string, { count: number, styleCounts: Record<string, { count: number, releases: DiscogsRelease[] }> }> = {};
  
  for (const r of releases) {
    if (r.basic_information.genres && r.basic_information.genres.length > 0) {
      // We consider all genres listed for a release to build a more comprehensive matrix
      for (const genre of r.basic_information.genres) {
        if (!genreMeta[genre]) {
          genreMeta[genre] = { count: 0, styleCounts: {} };
        }
        genreMeta[genre].count++;
        
        if (r.basic_information.styles) {
          for (const style of r.basic_information.styles) {
            if (!genreMeta[genre].styleCounts[style]) {
              genreMeta[genre].styleCounts[style] = { count: 0, releases: [] };
            }
            genreMeta[genre].styleCounts[style].count++;
            
            // Only add valid images to prevent "broken" crate digging records
            if (r.basic_information.cover_image && !r.basic_information.cover_image.includes('spacer.gif')) {
               genreMeta[genre].styleCounts[style].releases.push(r);
            }
          }
        }
      }
    }
  }

  const colors = ['#FF4F00', '#008080', '#FFDB58', '#FFB59E', '#76D6D5', '#353534'];
  
  return Object.entries(genreMeta)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6) // Top 6 genres to keep visualization clean
    .map(([name, data], i) => ({
      name,
      count: data.count,
      color: colors[i % colors.length],
      styles: Object.entries(data.styleCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 12) // Top 12 styles per genre for the drill-down matrix
        .map(([sName, sData]) => ({ name: sName, count: sData.count, releases: sData.releases }))
    }));
}

export function getTopVibrations(releases: DiscogsRelease[]) {
  const genreCounts: Record<string, number> = {};
  const currentYear = new Date().getFullYear();
  const recentCounts: Record<string, number> = {};

  for (const r of releases) {
    if (r.basic_information.genres && r.basic_information.genres.length > 0) {
      const mainGenre = r.basic_information.genres[0];
      genreCounts[mainGenre] = (genreCounts[mainGenre] || 0) + 1;

      const dateAdded = new Date(r.date_added);
      if (dateAdded.getFullYear() >= currentYear - 1) {
        recentCounts[mainGenre] = (recentCounts[mainGenre] || 0) + 1;
      }
    }
  }

  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  if (sortedGenres.length === 0) return null;

  const topGenre = { name: sortedGenres[0][0], count: sortedGenres[0][1] };

  const sortedRecent = Object.entries(recentCounts).sort((a, b) => b[1] - a[1]);
  const risingRhythm = sortedRecent.length > 0 ? { name: sortedRecent[0][0], count: sortedRecent[0][1] } : { name: topGenre.name, count: 0 };

  const hiddenGemCandidates = sortedGenres.slice(3);
  let hiddenGem = { name: 'Unknown', count: 0 };
  if (hiddenGemCandidates.length > 0) {
    const rand = Math.floor(Math.random() * hiddenGemCandidates.length);
    hiddenGem = { name: hiddenGemCandidates[rand][0], count: hiddenGemCandidates[rand][1] };
  } else if (sortedGenres.length > 1) {
    hiddenGem = { name: sortedGenres[sortedGenres.length - 1][0], count: sortedGenres[sortedGenres.length - 1][1] };
  }

  return { topGenre, risingRhythm, hiddenGem };
}

export interface CollectionValue {
  maximum: string;
  median: string;
  minimum: string;
}

export async function fetchCollectionValue(auth?: DiscogsAuth): Promise<CollectionValue | null> {
  const headers = getAuthHeaders(auth);
  const username = getUsername(auth);
  const userKey = getUserKey(auth);
  if (!headers.Authorization) return null;

  return enqueueDiscogsRequest(userKey, async () => {
    const res = await fetch(`${API_URL}/users/${username}/collection/value`, {
      headers,
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      console.error(`Failed to fetch collection value: ${res.statusText}`);
      return null;
    }
    return res.json();
  });
}

export interface ArtistData {
  id: number;
  name: string;
  count: number;
  releases: DiscogsRelease[];
  image: string;
}

/**
 * Normalizes artist names by removing Discogs-specific suffixes like " (2)".
 */
export function normalizeArtistName(name: string): string {
  return name.replace(/\s\(\d+\)$/, '');
}

/**
 * Aggregates releases by artist and sorts them by frequency.
 */
export function analyzeArtists(releases: DiscogsRelease[]): ArtistData[] {
  const artistMap: Record<number, { name: string; count: number; releases: DiscogsRelease[] }> = {};

  for (const r of releases) {
    if (!r.basic_information.artists) continue;
    
    for (const artist of r.basic_information.artists) {
      if (!artistMap[artist.id]) {
        artistMap[artist.id] = { name: artist.name, count: 0, releases: [] };
      }
      artistMap[artist.id].count++;
      artistMap[artist.id].releases.push(r);
    }
  }

  return Object.entries(artistMap)
    .filter(([id, data]) => {
      const normalized = normalizeArtistName(data.name).toLowerCase();
      // ID 194 is the reserved ID for "Various" in Discogs
      return id !== '194' && normalized !== 'various' && normalized !== 'various artists';
    })
    .map(([id, data]) => {
      // Find a valid cover image from the artist's releases
      const validImage = data.releases.find(r => 
        r.basic_information.cover_image && 
        !r.basic_information.cover_image.includes('spacer.gif')
      )?.basic_information.cover_image || '';

      return {
        id: parseInt(id),
        name: normalizeArtistName(data.name),
        count: data.count,
        releases: data.releases,
        image: validImage
      };
    })
    .sort((a, b) => b.count - a.count);
}
