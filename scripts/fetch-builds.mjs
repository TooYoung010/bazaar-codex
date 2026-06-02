// Fetch all build posts from bazaar-builds.net WordPress REST API
// Strategy:
//   - Use ?_fields=id,date,slug,title,excerpt,categories,tags,link,featured_media,jetpack_featured_media_url
//     to skip the heavy 'content' field (we'll fetch full content lazily on demand later if needed)
//   - per_page=100 (WP max), iterate all pages
//   - Save to data/raw/bb_posts.json
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw');
mkdirSync(RAW, { recursive: true });

const BASE = 'https://bazaar-builds.net/wp-json/wp/v2';
const FIELDS = [
  'id', 'date', 'modified', 'slug', 'title', 'excerpt',
  'categories', 'tags', 'link', 'featured_media',
  'jetpack_featured_media_url'
].join(',');

async function fetchJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'BazaarCodex/0.3 (personal)' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { json: await res.json(), headers: res.headers };
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
}

async function fetchAllPaged(endpoint, perPage = 100) {
  const all = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${BASE}/${endpoint}?per_page=${perPage}&page=${page}&_fields=${FIELDS}`;
    process.stdout.write(`  ${endpoint} page ${page}/${totalPages}... `);
    const { json, headers } = await fetchJson(url);
    if (page === 1) {
      totalPages = parseInt(headers.get('x-wp-totalpages')) || 1;
      console.log(`(total ${headers.get('x-wp-total')} items, ${totalPages} pages)`);
    } else {
      console.log(`got ${json.length}`);
    }
    all.push(...json);
    page++;
    // gentle pacing
    if (page <= totalPages) await new Promise(r => setTimeout(r, 300));
  }
  return all;
}

async function fetchAllRaw(endpoint, perPage = 100) {
  // For categories/tags we want all fields
  const all = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${BASE}/${endpoint}?per_page=${perPage}&page=${page}`;
    const { json, headers } = await fetchJson(url);
    if (page === 1) totalPages = parseInt(headers.get('x-wp-totalpages')) || 1;
    all.push(...json);
    page++;
    if (page <= totalPages) await new Promise(r => setTimeout(r, 200));
  }
  return all;
}

console.log('=== Fetching posts (3056 expected) ===');
const posts = await fetchAllPaged('posts', 100);
writeFileSync(join(RAW, 'bb_posts.json'), JSON.stringify(posts));
console.log(`✓ Saved ${posts.length} posts`);

console.log('\n=== Fetching categories ===');
const cats = await fetchAllRaw('categories', 100);
writeFileSync(join(RAW, 'bb_categories.json'), JSON.stringify(cats));
console.log(`✓ Saved ${cats.length} categories`);

console.log('\n=== Fetching tags ===');
const tags = await fetchAllRaw('tags', 100);
writeFileSync(join(RAW, 'bb_tags.json'), JSON.stringify(tags));
console.log(`✓ Saved ${tags.length} tags`);

console.log('\nDone.');
