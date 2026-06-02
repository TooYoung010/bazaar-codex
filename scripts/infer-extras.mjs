// Comprehensive cross-check: which BPP-only items belong to which hero,
// inferred from bazaar-builds.net category structure.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw');

const posts = JSON.parse(readFileSync(join(RAW, 'bb_posts.json'), 'utf8'));
const tags = JSON.parse(readFileSync(join(RAW, 'bb_tags.json'), 'utf8'));
const cats = JSON.parse(readFileSync(join(RAW, 'bb_categories.json'), 'utf8'));
const items = JSON.parse(readFileSync(join(RAW, 'items.json'), 'utf8')).data;
const bpp = JSON.parse(readFileSync(join(RAW, 'bpp_card_dict.json'), 'utf8'));

const tagById = new Map(tags.map(t => [t.id, t]));
const itemNameMap = new Map(items.map(i => [normalize(i.name), i]));

// Look at top-level hero categories
// From earlier output: 172 looks like Heroes parent. Let's enumerate hero cats.
const HERO_CAT_NAMES = ['Vanessa', 'Dooley', 'Pygmalien', 'Mak', 'Jules', 'Stelle', 'Karnok'];
const heroCatIdMap = {};
for (const c of cats) {
  if (HERO_CAT_NAMES.includes(c.name)) heroCatIdMap[c.name] = c.id;
}
console.log('Hero category IDs:', heroCatIdMap);

// For each post, determine its hero from category membership
function postHero(post) {
  for (const [hero, hcid] of Object.entries(heroCatIdMap)) {
    if (post.categories?.includes(hcid)) return hero;
  }
  // Fall back to title detection
  const t = post.title.rendered.toLowerCase();
  for (const h of HERO_CAT_NAMES) {
    if (t.includes(h.toLowerCase())) return h;
  }
  return null;
}

// Tally tag -> hero distribution
// tag -> { Vanessa: n, Dooley: n, ... }
const tagHeroFreq = new Map();
for (const p of posts) {
  const hero = postHero(p);
  if (!hero) continue;
  for (const tagId of p.tags || []) {
    if (!tagHeroFreq.has(tagId)) {
      tagHeroFreq.set(tagId, {});
    }
    const obj = tagHeroFreq.get(tagId);
    obj[hero] = (obj[hero] || 0) + 1;
  }
}

function normalize(s) {
  return s.toLowerCase().replace(/[''']/g, "'").replace(/\s+/g, ' ').trim();
}

const HTML_ENT = { '&amp;': '&', '&#039;': "'", '&apos;': "'", '&#8217;': "'" };
function decodeHtml(s) {
  if (!s) return '';
  return s.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c)).replace(/&[a-z]+;/gi, m => HTML_ENT[m] ?? m);
}

// For each BPP-only entry, find its primary hero (>= 70% of usage) or "Common"/"Multi"
const bppByEnName = new Map();
for (const [id, e] of Object.entries(bpp)) {
  const en = e.name?.['en-US'];
  if (en) bppByEnName.set(normalize(en), { id, ...e });
}

// Extra items we'll inject
const extras = [];
const heroAdditions = { Vanessa: 0, Dooley: 0, Pygmalien: 0, Mak: 0, Jules: 0, Stelle: 0, Karnok: 0, Common: 0, Multi: 0 };

for (const [tagId, freqByHero] of tagHeroFreq) {
  const tag = tagById.get(tagId);
  if (!tag) continue;
  const tagName = decodeHtml(tag.name);
  const norm = normalize(tagName);
  // Only care about BPP-only items (not in howbazaar)
  if (itemNameMap.has(norm)) continue;
  const bppEntry = bppByEnName.get(norm);
  if (!bppEntry) continue; // probably not an item

  // Compute hero share
  const total = Object.values(freqByHero).reduce((a, b) => a + b, 0);
  if (total < 2) continue;  // ignore noise
  const sorted = Object.entries(freqByHero).sort((a, b) => b[1] - a[1]);
  const [topHero, topCount] = sorted[0];
  const share = topCount / total;
  let hero;
  if (share >= 0.7) hero = topHero;
  else if (sorted.length >= 2 && sorted[0][1] === sorted[1][1]) hero = 'Common';
  else if (share >= 0.5) hero = topHero;  // softer threshold
  else hero = 'Common';

  heroAdditions[hero] = (heroAdditions[hero] || 0) + 1;
  extras.push({
    id: bppEntry.id,
    name: bppEntry.name['en-US'],
    nameCn: bppEntry.name['zh-CN'],
    size: bppEntry.size,
    image_url: bppEntry.image_url || null,
    inferredHero: hero,
    confidence: share.toFixed(2),
    totalUsage: total,
    distribution: freqByHero
  });
}

// Sort by hero, then usage
extras.sort((a, b) => a.inferredHero.localeCompare(b.inferredHero) || b.totalUsage - a.totalUsage);

console.log(`\nExtra items inferred: ${extras.length}`);
console.log('Hero additions:', heroAdditions);

// Per-hero summary
console.log('\n=== Per-hero new items ===');
for (const h of [...HERO_CAT_NAMES, 'Common']) {
  const list = extras.filter(e => e.inferredHero === h);
  console.log(`\n${h} (${list.length} items, top 30):`);
  list.slice(0, 30).forEach(e => {
    console.log(`  [${e.totalUsage}x conf=${e.confidence}] ${e.name.padEnd(28)} ${e.nameCn} (${e.size||'?'})`);
  });
}

writeFileSync(join(RAW, 'extra_items.json'), JSON.stringify(extras, null, 2));
console.log(`\n✓ Saved ${extras.length} extra items to data/raw/extra_items.json`);
