// Filter news posts from bb_posts.json (category 21 = News) and copy forge changelogs
// to src/data/ for the news page.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RAW = join(ROOT, 'data', 'raw');
const OUT = join(ROOT, 'src', 'data');

// 1) bb News posts: WP category 21 = "News"
// We need full content for these (we did NOT include `content` in initial fetch).
// Quickest path: re-fetch just news posts with content.
const NEWS_CAT_ID = 21;
const PAGE_SIZE = 100;

async function fetchNews() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `https://bazaar-builds.net/wp-json/wp/v2/posts?categories=${NEWS_CAT_ID}&per_page=${PAGE_SIZE}&page=${page}&_fields=id,date,title,excerpt,content,link,jetpack_featured_media_url`;
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  page ${page}: ${res.status}`);
      break;
    }
    if (page === 1) totalPages = parseInt(res.headers.get('x-wp-totalpages')) || 1;
    const data = await res.json();
    all.push(...data);
    process.stdout.write(`  bb_news page ${page}/${totalPages}: ${all.length} so far\r`);
    page++;
  }
  console.log('');
  return all;
}

console.log('Fetching bazaar-builds news posts (category=News)...');
const bbNews = await fetchNews();
writeFileSync(join(OUT, 'bb-news.json'), JSON.stringify(bbNews));
console.log(`✓ bb-news: ${bbNews.length} posts`);

// 2) forge changelogs (already fetched, just copy)
const changelogs = JSON.parse(readFileSync(join(RAW, 'forge_changelogs.json'), 'utf8'));
writeFileSync(join(OUT, 'forge-changelogs.json'), JSON.stringify(changelogs));
console.log(`✓ forge-changelogs: ${changelogs.length} entries`);

// Show date span
const dates = bbNews.map(p => p.date.slice(0, 10)).sort();
console.log(`bb-news date range: ${dates[0]} ~ ${dates[dates.length - 1]}`);
const fgDates = changelogs.map(c => (c.created_at || '').slice(0, 10)).sort();
console.log(`forge-changelogs date range: ${fgDates[0]} ~ ${fgDates[fgDates.length - 1]}`);
