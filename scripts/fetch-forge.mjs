// Fetch bazaarforge.gg's Supabase tables: builds, items, heroes, news_posts, changelogs
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw');
mkdirSync(RAW, { recursive: true });

const SUPABASE_URL = 'https://cwlgghqlqvpbmfuvkvle.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bGdnaHFscXZwYm1mdXZrdmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODIzNDYsImV4cCI6MjA3OTY1ODM0Nn0.fuVBdRQ1rMPerBGnlS08FLOvZKSlICwtJq1WKEj7YA8';

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  Prefer: 'count=exact'
};

const PAGE = 1000; // Supabase default limit. Use Range header for paging.

async function fetchAll(table, select = '*', orderBy = 'created_at.asc') {
  const all = [];
  let offset = 0;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=${orderBy}&limit=${PAGE}&offset=${offset}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`${res.status} ${t}`);
    }
    const data = await res.json();
    all.push(...data);
    process.stdout.write(`  ${table}: ${all.length} fetched\r`);
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  console.log(`\n  ${table}: ✓ ${all.length} total`);
  return all;
}

const targets = [
  ['heroes',     '*'],
  ['items',      'id,name,description,starting_tier,heroes,size,tier,tags,build_count,build_count_with_hero,build_percentage,hero_stats,image_url,enchantments,ignore_merchants'],
  ['builds',     'id,title,description,screenshot_url,user_name,created_at,likes,hero,item_ids,wins,max_health,level,income,gold,victory_type,ignored,youtube_url'],
  ['news_posts', 'id,title,subtitle,slug,main_image_url,category,is_published,published_at,view_count,created_at'],
  ['changelogs', '*']
];

for (const [t, sel] of targets) {
  console.log(`\nFetching ${t}...`);
  const data = await fetchAll(t, sel);
  writeFileSync(join(RAW, `forge_${t}.json`), JSON.stringify(data));
}
console.log('\nDone.');
