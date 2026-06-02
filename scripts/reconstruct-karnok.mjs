// Reverse-engineer Karnok items from bazaar-builds.net Karnok-tagged posts
import { readFileSync } from 'node:fs';
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
const itemById = new Map(items.map(i => [i.id, i]));

// Find category id for Karnok-related parent (heroes parent? let's find)
// Look for Karnok hero parent id
const karnokCats = cats.filter(c => c.name.toLowerCase().includes('karnok'));
console.log('Karnok-related categories:');
karnokCats.forEach(c => console.log(`  [${c.id}] count=${c.count} parent=${c.parent} name="${c.name}"`));

// Posts whose title mentions Karnok
const karnokPosts = posts.filter(p =>
  p.title.rendered.toLowerCase().includes('karnok')
);
console.log(`\nKarnok posts (by title): ${karnokPosts.length}`);

// Aggregate all tag IDs from Karnok posts
const tagFreq = new Map();
for (const p of karnokPosts) {
  for (const tagId of p.tags || []) {
    tagFreq.set(tagId, (tagFreq.get(tagId) || 0) + 1);
  }
}
const sortedTags = [...tagFreq.entries()].sort((a, b) => b[1] - a[1]);

console.log(`\nUnique tags across Karnok posts: ${sortedTags.length}`);
console.log('Top 50 tags by frequency:');

// For each tag, check if it matches a known item or BPP entry
const itemNameMap = new Map(items.map(i => [normalize(i.name), i]));
const bppByEnName = new Map();
for (const [id, e] of Object.entries(bpp)) {
  const en = e.name?.['en-US'];
  if (en) bppByEnName.set(normalize(en), { id, ...e });
}

function normalize(s) {
  return s.toLowerCase().replace(/[''']/g, "'").replace(/\s+/g, ' ').trim();
}

for (const [tagId, freq] of sortedTags.slice(0, 60)) {
  const tag = tagById.get(tagId);
  if (!tag) continue;
  const tagName = decodeHtml(tag.name);
  const norm = normalize(tagName);
  const inHowbazaar = itemNameMap.has(norm);
  const inBpp = bppByEnName.has(norm);
  const status =
    inHowbazaar ? `IN-HOWBAZAAR (hero=${itemNameMap.get(norm).heroes?.[0]})` :
    inBpp ? `BPP-ONLY id=${bppByEnName.get(norm).id}` :
    'UNKNOWN';
  console.log(`  [${freq}x] ${tagName.padEnd(30)} | ${status}`);
}

const HTML_ENT = { '&amp;': '&', '&#039;': "'", '&apos;': "'", '&#8217;': "'" };
function decodeHtml(s) {
  if (!s) return '';
  return s.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c)).replace(/&[a-z]+;/gi, m => HTML_ENT[m] ?? m);
}

// Final list: all BPP-only items that appear as tags in Karnok posts
console.log('\n=== Karnok items reconstructed (BPP-only tags from Karnok posts) ===');
const reconstructed = [];
for (const [tagId, freq] of sortedTags) {
  const tag = tagById.get(tagId);
  if (!tag) continue;
  const tagName = decodeHtml(tag.name);
  const norm = normalize(tagName);
  if (!itemNameMap.has(norm) && bppByEnName.has(norm)) {
    const e = bppByEnName.get(norm);
    reconstructed.push({
      id: e.id,
      enName: e.name['en-US'],
      cnName: e.name['zh-CN'],
      size: e.size,
      image_url: e.image_url,
      occurrences: freq
    });
  }
}
reconstructed.sort((a, b) => b.occurrences - a.occurrences);
console.log(`Total Karnok-only items reconstructed: ${reconstructed.length}`);
reconstructed.forEach(r => console.log(`  [${r.occurrences}x] ${r.enName.padEnd(30)} ${r.cnName.padEnd(20)} size=${r.size||'?'}`));
