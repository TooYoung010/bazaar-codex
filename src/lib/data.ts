import itemsData from '@/data/items.json';
import heroesData from '@/data/heroes.json';
import buildsData from '@/data/builds.json';
import type { Item, Hero, Build } from './types';

export const items = itemsData as unknown as Item[];
export const heroes = heroesData as unknown as Hero[];
export const builds = buildsData as unknown as Build[];

export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const itemById = new Map(items.map(i => [i.id, i]));
const itemBySlug = new Map(items.map(i => [slug(i.name), i]));
const buildById = new Map(builds.map(b => [b.id, b]));

export function getItemBySlug(s: string): Item | undefined {
  return itemBySlug.get(s);
}

export function getItemById(id: string): Item | undefined {
  return itemById.get(id);
}

export function getItemsByHero(heroKey: string): Item[] {
  if (heroKey === 'all') return items;
  return items.filter(i => i.heroKey === heroKey);
}

export function getBuildById(id: string): Build | undefined {
  return buildById.get(id);
}

export function getBuildsForItem(itemId: string, limit = 30): Build[] {
  // builds list is already sorted newest first
  const out: Build[] = [];
  for (const b of builds) {
    if (b.itemIds.includes(itemId) || b.coreItemId === itemId) {
      out.push(b);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function getBuildsByHero(heroKey: string): Build[] {
  if (heroKey === 'all') return builds;
  return builds.filter(b => b.heroKey === heroKey);
}

export function getHero(key: string): Hero | undefined {
  return heroes.find(h => h.key === key);
}

export function searchItems(query: string, limit = 50): Item[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: Item[] = [];
  for (const it of items) {
    if (it.name.toLowerCase().includes(q) ||
        (it.nameCn && it.nameCn.includes(query.trim())) ||
        it.tags.some(t => t.toLowerCase().includes(q))) {
      out.push(it);
      if (out.length >= limit) break;
    }
  }
  return out;
}

// Featured items per hero (kept for homepage fallback)
export function getFeaturedItems(): Item[] {
  const out: Item[] = [];
  const heroOrder = ['vanessa', 'dooley', 'pygmalien', 'mak', 'jules', 'stelle'];
  for (const hk of heroOrder) {
    const heroItems = items.filter(i => i.heroKey === hk && (i.startingTier === 'Gold' || i.startingTier === 'Diamond'));
    const sorted = heroItems.sort((a, b) => a.id.localeCompare(b.id));
    out.push(...sorted.slice(0, 2));
  }
  return out;
}

export function getLatestBuilds(limit = 6): Build[] {
  return builds.slice(0, limit); // already sorted desc by createdAt at build time
}

// Builds with strong meta (10-X result + structured items) for "top" section
export function getTopBuilds(limit = 12): Build[] {
  // Prefer: forge source > 10 wins > many items > newer
  const ranked = [...builds]
    .filter(b => b.itemIds.length >= 3 && b.result)
    .sort((a, b) => {
      // Forge has structured item_ids -> better data quality
      const sa = a.dataSource === 'bazaarforge' ? 0 : 1;
      const sb = b.dataSource === 'bazaarforge' ? 0 : 1;
      if (sa !== sb) return sa - sb;
      const scoreA = scoreResult(a.result);
      const scoreB = scoreResult(b.result);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  return ranked.slice(0, limit);
}

function scoreResult(r: string | null): number {
  if (!r) return 99;
  const m = r.match(/(\d+)[-–](\d+)/);
  if (m) return parseInt(m[2]); // smaller losses = better
  if (/[Ww]/.test(r)) return 0;
  return 50;
}
