// News aggregator: pulls from 3 sources at request time (with ISR cache).
//   1) Steam Official Announcements (api.steampowered.com) - authoritative, daily-fresh
//   2) bazaar-builds.net News category - community news, has rich images
//   3) bazaarforge.gg changelogs - site updates
//
// Output: unified News[] sorted newest first.

import bbPosts from '@/data/bb-news.json';
import forgeChangelogs from '@/data/forge-changelogs.json';

export type NewsSource = 'steam' | 'bazaar-builds' | 'bazaarforge';

export interface News {
  id: string;
  title: string;
  date: string;            // ISO
  source: NewsSource;
  sourceLabel: string;
  category?: string;       // patch / event / community
  author?: string;
  excerpt: string;
  bodyHtml: string;        // already-converted HTML
  link: string;            // canonical URL
  image?: string | null;
}

const STEAM_APP_ID = 1617400;

// --- BBCode -> HTML for Steam announcements ---
function bbcodeToHtml(s: string): string {
  if (!s) return '';
  let h = s
    // Headings
    .replace(/\[h([1-3])\](.*?)\[\/h\1\]/gis, (_m, lv, t) => `<h${Math.min(parseInt(lv) + 2, 4)}>${t}</h${Math.min(parseInt(lv) + 2, 4)}>`)
    // Bold / italic / underline
    .replace(/\[b\](.*?)\[\/b\]/gis, '<strong>$1</strong>')
    .replace(/\[i\](.*?)\[\/i\]/gis, '<em>$1</em>')
    .replace(/\[u\](.*?)\[\/u\]/gis, '<u>$1</u>')
    // Lists
    .replace(/\[list\]/gi, '<ul>')
    .replace(/\[\/list\]/gi, '</ul>')
    .replace(/\[olist\]/gi, '<ol>')
    .replace(/\[\/olist\]/gi, '</ol>')
    .replace(/\[\*\]/gi, '<li>')
    // Paragraphs
    .replace(/\[p\](.*?)\[\/p\]/gis, '<p>$1</p>')
    // Images
    .replace(/\[img\](.*?)\[\/img\]/gis, '<img src="$1" alt="" />')
    .replace(/\[img\s+src="([^"]+)"[^\]]*\]/gi, '<img src="$1" alt="" />')
    // Links
    .replace(/\[url=([^\]]+)\](.*?)\[\/url\]/gis, '<a href="$1" target="_blank" rel="noopener">$2</a>')
    .replace(/\[url\](.*?)\[\/url\]/gis, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    // Quote
    .replace(/\[quote(?:=[^\]]+)?\](.*?)\[\/quote\]/gis, '<blockquote>$1</blockquote>')
    // Strip remaining unknown tags
    .replace(/\[\/?[a-z][^\]]*\]/gi, '');
  return h;
}

function plainTextFrom(html: string, max = 240): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function categorizeSteam(title: string): string {
  const t = title.toLowerCase();
  if (/patch|hotfix|update/.test(t)) return '补丁';
  if (/event|tournament|tourney/.test(t)) return '活动';
  return '公告';
}

async function fetchSteamNews(count = 20): Promise<News[]> {
  try {
    const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${STEAM_APP_ID}&count=${count}&format=json`;
    const res = await fetch(url, {
      next: { revalidate: 3600 } // 1 hour ISR
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.appnews?.newsitems || [];
    return items.map((n: { gid: string; title: string; date: number; author?: string; contents?: string; url: string; feedlabel?: string }) => {
      const html = bbcodeToHtml(n.contents || '');
      return {
        id: `steam-${n.gid}`,
        title: n.title,
        date: new Date(n.date * 1000).toISOString(),
        source: 'steam' as const,
        sourceLabel: 'Steam 官方',
        category: categorizeSteam(n.title),
        author: n.author,
        excerpt: plainTextFrom(html, 200),
        bodyHtml: html,
        link: n.url,
        image: null
      };
    });
  } catch {
    return [];
  }
}

function loadBbNews(): News[] {
  // bbPosts already filtered to category 21 (News) at build time
  type BbPost = {
    id: number;
    date: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
    link: string;
    jetpack_featured_media_url?: string | null;
  };
  const HTML_ENT: Record<string, string> = {
    '&amp;': '&', '&#039;': "'", '&apos;': "'", '&#8217;': "'",
    '&#8211;': '–', '&#8212;': '—', '&quot;': '"'
  };
  function decodeHtml(s: string) {
    return (s || '').replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c)).replace(/&[a-z]+;/gi, m => HTML_ENT[m] ?? m);
  }
  return (bbPosts as BbPost[]).map(p => ({
    id: `bb-${p.id}`,
    title: decodeHtml(p.title.rendered),
    date: p.date,
    source: 'bazaar-builds' as const,
    sourceLabel: 'bazaar-builds 社区',
    category: '社区',
    excerpt: plainTextFrom(p.excerpt.rendered, 200),
    bodyHtml: p.content.rendered,
    link: p.link,
    image: p.jetpack_featured_media_url || null
  }));
}

function loadForgeChangelogs(): News[] {
  type Cl = { id: string; title: string; content: string; created_at: string; published?: boolean };
  return (forgeChangelogs as Cl[])
    .filter(c => c.published !== false)
    .map(c => ({
      id: `fg-cl-${c.id}`,
      title: c.title,
      date: c.created_at,
      source: 'bazaarforge' as const,
      sourceLabel: 'bazaarforge 站点',
      category: '站点更新',
      excerpt: plainTextFrom(c.content || '', 180),
      bodyHtml: (c.content || '').split('\n').map(l => l.trim() ? `<p>${l}</p>` : '').join(''),
      link: 'https://bazaarforge.gg/',
      image: null
    }));
}

export async function getAllNews(): Promise<News[]> {
  const [steam] = await Promise.all([fetchSteamNews(20)]);
  const bb = loadBbNews();
  const fg = loadForgeChangelogs();
  const all = [...steam, ...bb, ...fg];
  all.sort((a, b) => b.date.localeCompare(a.date));
  return all;
}

export async function getNewsById(id: string): Promise<News | undefined> {
  const all = await getAllNews();
  return all.find(n => n.id === id);
}
