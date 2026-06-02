// Cross-analysis: forge items vs howbazaar items, build datasets
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw');

const forgeItems  = JSON.parse(readFileSync(join(RAW, 'forge_items.json'), 'utf8'));
const forgeBuilds = JSON.parse(readFileSync(join(RAW, 'forge_builds.json'), 'utf8'));
const hbItems     = JSON.parse(readFileSync(join(RAW, 'items.json'), 'utf8')).data;
const bbPosts     = JSON.parse(readFileSync(join(RAW, 'bb_posts.json'), 'utf8'));

console.log(`forge_items: ${forgeItems.length}`);
console.log(`howbazaar items: ${hbItems.length}`);
console.log(`forge_builds: ${forgeBuilds.length}`);
console.log(`bb_posts: ${bbPosts.length}`);

// 1) Items: hero distribution
console.log('\n=== forge_items: hero distribution ===');
const heroDist = {};
for (const it of forgeItems) {
  const heroes = it.heroes || [];
  if (heroes.length === 0) heroes.push('NONE');
  for (const h of heroes) heroDist[h] = (heroDist[h] || 0) + 1;
}
Object.entries(heroDist).sort((a,b)=>b[1]-a[1]).forEach(([h,c]) => console.log(`  ${h}: ${c}`));

// 2) IDs comparison
const hbIds = new Set(hbItems.map(i => i.id));
const fgIds = new Set(forgeItems.map(i => i.id));
const onlyHb = [...hbIds].filter(id => !fgIds.has(id));
const onlyFg = [...fgIds].filter(id => !hbIds.has(id));
console.log(`\nIDs only in howbazaar: ${onlyHb.length}`);
console.log(`IDs only in forge:     ${onlyFg.length}`);

// Sample forge-only items
if (onlyFg.length > 0) {
  console.log('Forge-only items (first 5):');
  forgeItems.filter(i => onlyFg.includes(i.id)).slice(0, 5).forEach(i => {
    console.log(`  ${i.name} | heroes=${JSON.stringify(i.heroes)} starting_tier=${i.starting_tier}`);
  });
}

// 3) builds: how many have item_ids?
const withItems = forgeBuilds.filter(b => Array.isArray(b.item_ids) && b.item_ids.length > 0);
console.log(`\nforge_builds with item_ids: ${withItems.length} / ${forgeBuilds.length}`);

// 4) builds: hero distribution
console.log('\n=== forge_builds: hero distribution ===');
const bd = {};
for (const b of forgeBuilds) {
  const h = b.hero || 'NONE';
  bd[h] = (bd[h] || 0) + 1;
}
Object.entries(bd).sort((a,b)=>b[1]-a[1]).forEach(([h,c]) => console.log(`  ${h}: ${c}`));

// 5) builds: date distribution
console.log('\n=== forge_builds: date distribution ===');
const dd = {};
for (const b of forgeBuilds) {
  const m = (b.created_at || '').slice(0, 7);
  dd[m] = (dd[m] || 0) + 1;
}
Object.keys(dd).sort().forEach(k => console.log(`  ${k}: ${dd[k]}`));

// 6) builds: detect which have wins=10 victory type
const wins10 = forgeBuilds.filter(b => b.wins === 10).length;
const ignored = forgeBuilds.filter(b => b.ignored).length;
console.log(`\nWins=10: ${wins10}`);
console.log(`Ignored: ${ignored}`);

// 7) Check overlap with bb_posts (any deduplication needed?)
// bb_posts use WP IDs (numeric), forge uses uuid -- so they CANNOT collide
// But same content might be re-posted by user. Quick check by title similarity.
const bbTitles = new Set(bbPosts.map(p => p.title.rendered.toLowerCase().replace(/[^a-z0-9]/g,'')));
let dupCount = 0;
for (const fb of forgeBuilds) {
  const t = (fb.title || '').toLowerCase().replace(/[^a-z0-9]/g,'');
  if (bbTitles.has(t)) dupCount++;
}
console.log(`\nForge builds with same title as a bb post: ${dupCount} / ${forgeBuilds.length}`);
