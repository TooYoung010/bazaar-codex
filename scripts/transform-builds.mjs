// Transform builds from TWO sources into a unified site-ready list:
//   1) bazaar-builds.net (WordPress posts)        -> historical, ~3056
//   2) bazaarforge.gg (Supabase builds table)     -> active, fresh until today, ~3114
//
// Each output build has: id, slug, name, hero, heroName, heroKey, image,
// itemIds, coreItemId, author, result/wins, link, createdAt, dataSource.
//
// Forge builds use structured item_ids (UUIDs) -> 100% accurate linking.
// BB posts use WP tag text matching -> ~82% accuracy.
//
// Sort newest first.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RAW = join(ROOT, 'data', 'raw');
const OUT = join(ROOT, 'src', 'data');

// --- Inputs ---
const bbPosts = JSON.parse(readFileSync(join(RAW, 'bb_posts.json'), 'utf8'));
const bbCats  = JSON.parse(readFileSync(join(RAW, 'bb_categories.json'), 'utf8'));
const bbTags  = JSON.parse(readFileSync(join(RAW, 'bb_tags.json'), 'utf8'));
const fgBuilds = JSON.parse(readFileSync(join(RAW, 'forge_builds.json'), 'utf8'));
const items = JSON.parse(readFileSync(join(OUT, 'items.json'), 'utf8'));

const HERO_DISPLAY = {
  Vanessa: '凡妮莎', Dooley: '杜利', Pygmalien: '皮格马利安',
  Mak: '马克', Jules: '朱尔斯', Stelle: '斯黛拉', Karnok: '卡诺克'
};
const HERO_KEY = {
  Vanessa: 'vanessa', Dooley: 'dooley', Pygmalien: 'pygmalien',
  Mak: 'mak', Jules: 'jules', Stelle: 'stelle', Karnok: 'karnok'
};

const HTML_ENT = { '&amp;':'&','&#039;':"'",'&apos;':"'",'&#8217;':"'",'&#8211;':'–','&#8212;':'—','&quot;':'"' };
function decodeHtml(s) {
  if (!s) return '';
  return s.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c)).replace(/&[a-z]+;/gi, m => HTML_ENT[m] ?? m);
}
function stripHtml(s) {
  return decodeHtml((s || '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}
function normalize(s) {
  return s.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').trim();
}

const itemNameMap = new Map(items.map(i => [normalize(i.name), i.id]));
const validItemIds = new Set(items.map(i => i.id));

// =============== bazaar-builds.net (WP) ===============
const bbCatById = new Map(bbCats.map(c => [c.id, c]));
const bbTagById = new Map(bbTags.map(t => [t.id, t]));
const AUTHOR_PARENT_ID = 308;
const HERO_TOKENS = {
  Pygmalien: ['pygmalien','pyg'],
  Vanessa: ['vanessa'],
  Dooley: ['dooley'],
  Stelle: ['stelle'],
  Karnok: ['karnok'],
  Jules: ['jules'],
  Mak: [' mak ','mak ',' mak,',"mak'",'mak builds','mak build']
};
function detectBbHero(post) {
  // Use category first (most accurate)
  const HERO_CAT_IDS = { Vanessa: 327, Dooley: 45, Pygmalien: 173, Mak: 49, Jules: 50, Stelle: 1108, Karnok: 2175 };
  for (const [hero, cid] of Object.entries(HERO_CAT_IDS)) {
    if (post.categories?.includes(cid)) return hero;
  }
  // Fallback: title token
  const title = decodeHtml(post.title.rendered).toLowerCase();
  const order = ['Pygmalien','Vanessa','Dooley','Stelle','Karnok','Jules','Mak'];
  for (const h of order) for (const tok of HERO_TOKENS[h]) if (title.includes(tok)) return h;
  return null;
}
function detectResult(title) {
  const m = title.match(/\b(10[-–]\d+|10\s*[Ww](?:in)?|14[-–]\d+)\b/);
  return m ? m[0].replace(/\s+/g, '') : null;
}
function detectAuthor(post) {
  for (const cid of post.categories || []) {
    const c = bbCatById.get(cid);
    if (c && c.parent === AUTHOR_PARENT_ID) return decodeHtml(c.name);
  }
  const t = decodeHtml(post.title.rendered);
  const m = t.match(/[-–]\s*([A-Za-z0-9_]+)\s*$/);
  return m ? m[1] : null;
}
function bbItemIds(post) {
  const ids = new Set();
  for (const tagId of post.tags || []) {
    const tag = bbTagById.get(tagId);
    if (!tag) continue;
    const name = decodeHtml(tag.name);
    const id = itemNameMap.get(normalize(name));
    if (id) ids.add(id);
  }
  return [...ids];
}
function detectCoreItemId(post) {
  for (const cid of post.categories || []) {
    const c = bbCatById.get(cid);
    if (!c) continue;
    const m = decodeHtml(c.name).match(/^(.+?)\s+Build$/i);
    if (m) {
      const id = itemNameMap.get(normalize(m[1]));
      if (id) return id;
    }
  }
  return null;
}

const bbBuilds = bbPosts.map(p => {
  const title = decodeHtml(p.title.rendered);
  const hero = detectBbHero(p);
  return {
    id: `bb-${p.id}`,
    slug: p.slug,
    name: title,
    hero: hero || 'Unknown',
    heroName: hero ? HERO_DISPLAY[hero] : '未分类',
    heroKey: hero ? HERO_KEY[hero] : 'unknown',
    description: stripHtml(p.excerpt.rendered).slice(0, 200),
    image: p.jetpack_featured_media_url || null,
    itemIds: bbItemIds(p),
    coreItemId: detectCoreItemId(p),
    author: detectAuthor(p),
    result: detectResult(title),
    link: p.link,
    createdAt: p.date,
    dataSource: 'bazaar-builds'
  };
});

// =============== bazaarforge ===============
const fgList = fgBuilds
  .filter(b => !b.ignored)
  .map(b => {
    const title = b.title || '(无标题)';
    // item_ids may be a JSON array of UUIDs
    let itemIds = Array.isArray(b.item_ids) ? b.item_ids : [];
    // Filter out IDs we don't have
    itemIds = itemIds.filter(id => validItemIds.has(id));
    const wins = b.wins;
    let result = null;
    if (wins === 10) result = '10W';
    else if (typeof wins === 'number') result = `${wins}W`;
    return {
      id: `fg-${b.id}`,
      slug: b.id,
      name: title,
      hero: b.hero || 'Unknown',
      heroName: b.hero ? (HERO_DISPLAY[b.hero] || b.hero) : '未分类',
      heroKey: b.hero ? (HERO_KEY[b.hero] || 'unknown') : 'unknown',
      description: (b.description || '').slice(0, 200),
      image: b.screenshot_url || null,
      itemIds,
      coreItemId: itemIds[0] || null,
      author: b.user_name || null,
      result,
      wins: b.wins ?? null,
      maxHealth: b.max_health ?? null,
      level: b.level ?? null,
      gold: b.gold ?? null,
      victoryType: b.victory_type ?? null,
      link: `https://bazaarforge.gg/build/${b.id}`,
      createdAt: b.created_at,
      dataSource: 'bazaarforge'
    };
  });

// =============== Merge & sort ===============
const builds = [...fgList, ...bbBuilds].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

writeFileSync(join(OUT, 'builds.json'), JSON.stringify(builds));

// --- Stats ---
console.log(`Total builds: ${builds.length}`);
console.log(`  bazaarforge:  ${fgList.length} (active source)`);
console.log(`  bazaar-builds.net: ${bbBuilds.length} (historical source)`);
console.log('');

const byHero = {};
for (const b of builds) byHero[b.hero] = (byHero[b.hero] || 0) + 1;
console.log('Per hero:');
Object.entries(byHero).sort((a,b)=>b[1]-a[1]).forEach(([h,n]) => console.log(`  ${h}: ${n}`));

const withItems = builds.filter(b => b.itemIds.length > 0).length;
console.log(`\nWith item_ids: ${withItems} (${(100*withItems/builds.length).toFixed(1)}%)`);

const newest = builds.slice(0, 5);
console.log('\nNewest 5 builds:');
newest.forEach(b => console.log(`  ${b.createdAt}  [${b.dataSource}]  ${b.heroName}  ${b.name?.slice(0, 70)}`));

const dateGroups = {};
for (const b of builds) {
  const m = (b.createdAt || '').slice(0, 7);
  dateGroups[m] = (dateGroups[m] || 0) + 1;
}
console.log('\nBuilds by month (last 6):');
Object.keys(dateGroups).sort().slice(-8).forEach(m => console.log(`  ${m}: ${dateGroups[m]}`));
