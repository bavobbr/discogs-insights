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

const DISCOGS_USERNAME = process.env.DISCOGS_USERNAME || 'bavobbr'; // Fallback or loaded from env
const API_URL = 'https://api.discogs.com';

export async function fetchCollection(page: number = 1, perPage: number = 100, force: boolean = false): Promise<CollectionResponse | null> {
  const token = process.env.DISCOGS_PAT;
  if (!token) {
    console.error("Missing DISCOGS_PAT environment variable.");
    return null;
  }

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
    headers: {
      'Authorization': `Discogs token=${token}`,
      'User-Agent': 'VinylPulse/1.0 +github.com/bavobbr',
    },
  };

  if (force) {
    fetchOptions.cache = 'no-store';
  } else {
    fetchOptions.next = { revalidate: 3600 };
  }

  const res = await fetch(`${API_URL}/users/${DISCOGS_USERNAME}/collection/folders/0/releases?page=${page}&per_page=${perPage}`, fetchOptions);

  if (!res.ok) {
    console.error(`Failed to fetch from Discogs: ${res.statusText}`);
    return null;
  }

  return res.json();
}

/**
 * Aggregates all user releases, handling pagination. Can be limited by DEV_LIMIT.
 */
export async function fetchAllUserReleases(): Promise<DiscogsRelease[]> {
  const devLimit = process.env.DEV_LIMIT ? parseInt(process.env.DEV_LIMIT, 10) : Infinity;
  let allReleases: DiscogsRelease[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const data = await fetchCollection(page, perPage);
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

export function analyzeDecades(releases: DiscogsRelease[]) {
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
    const year = r.basic_information.year;
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

export async function fetchCollectionValue(): Promise<CollectionValue | null> {
  const token = process.env.DISCOGS_PAT;
  const username = process.env.DISCOGS_USERNAME || 'bavobbr';
  if (!token) return null;

  const res = await fetch(`https://api.discogs.com/users/${username}/collection/value`, {
    headers: {
      'Authorization': `Discogs token=${token}`,
      'User-Agent': 'VinylPulse/1.0 +github.com/bavobbr',
    },
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    console.error(`Failed to fetch collection value: ${res.statusText}`);
    return null;
  }
  return res.json();
}
