// Mrmao leaderboard API client (server-side fetch with caching).
// API quirks discovered:
//   - `pageSize` param is ignored, but `size` works (we use 100 to minimize round trips)
//   - `seasonId` / `mainClass` / `q` query params are silently ignored — server returns all
//   - Total dataset: 35000 rows, sorted by rating desc

export interface LeaderboardEntry {
  username: string;
  rating: number;
  position: number;
  seasonId: number;
  mainClass: string;
}

export interface LeaderboardResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  items: LeaderboardEntry[];
}

export interface Season {
  name: string;
  startTime: string;
  seasonApiId: number;
}

const BASE = 'https://bazaar.mrmao.life/api';
const PAGE_SIZE = 100;

// Map mrmao mainClass codes to hero ids. Inferred from sample data.
export const CLASS_MAP: Record<string, { id: string; name: string }> = {
  v: { id: 'Vanessa',   name: '凡妮莎' },
  d: { id: 'Dooley',    name: '杜利' },
  p: { id: 'Pygmalien', name: '皮格马利安' },
  m: { id: 'Mak',       name: '马克' },
  j: { id: 'Jules',     name: '朱尔斯' },
  s: { id: 'Stelle',    name: '斯黛拉' },
  k: { id: 'Karnok',    name: '卡诺克' }
};

export function classLabel(code: string): string {
  if (CLASS_MAP[code]) return CLASS_MAP[code].name;
  if (code === '未知' || !code) return '未知';
  return code;
}

async function fetchPage(page: number): Promise<LeaderboardResponse> {
  const url = `${BASE}/leaderboard?page=${page}&size=${PAGE_SIZE}`;
  const res = await fetch(url, {
    next: { revalidate: 300 }, // ISR cache: refresh every 5 min
    headers: { 'User-Agent': 'BazaarCodex/0.3' }
  });
  if (!res.ok) throw new Error(`mrmao ${res.status}`);
  return res.json();
}

export async function getSeasons(): Promise<Season[]> {
  const res = await fetch(`${BASE}/seasons`, {
    next: { revalidate: 3600 },
    headers: { 'User-Agent': 'BazaarCodex/0.3' }
  });
  if (!res.ok) return [];
  return res.json();
}

// Get top-N entries (used on the ranking page hero list)
export async function getTopEntries(limit = 200): Promise<LeaderboardEntry[]> {
  const pages = Math.ceil(limit / PAGE_SIZE);
  const out: LeaderboardEntry[] = [];
  for (let p = 1; p <= pages; p++) {
    try {
      const data = await fetchPage(p);
      out.push(...data.items);
      if (out.length >= limit) break;
    } catch {
      break;
    }
  }
  return out.slice(0, limit);
}

// Search across full dataset by username (case-insensitive substring match).
// Walks all pages until found / timeout.
export async function searchByUsername(query: string, maxPages = 35, limit = 50): Promise<LeaderboardEntry[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches: LeaderboardEntry[] = [];
  for (let p = 1; p <= maxPages; p++) {
    try {
      const data = await fetchPage(p);
      for (const it of data.items) {
        if (it.username.toLowerCase().includes(q)) {
          matches.push(it);
          if (matches.length >= limit) return matches;
        }
      }
      if (data.currentPage >= data.totalPages) break;
    } catch {
      break;
    }
  }
  return matches;
}
