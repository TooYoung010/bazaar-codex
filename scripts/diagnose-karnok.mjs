// Investigate why Karnok only has 1 item
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const items = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'raw', 'items.json'), 'utf8')).data;

console.log(`Total items: ${items.length}`);

// 1. Distribution of heroes
const heroCount = {};
for (const it of items) {
  const heroes = it.heroes || ['Common'];
  for (const h of heroes) heroCount[h] = (heroCount[h] || 0) + 1;
}
console.log('\nHero presence (multi-hero items count multiple times):');
for (const [h, c] of Object.entries(heroCount).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${h}: ${c}`);
}

// 2. Karnok items detail
console.log('\nKarnok items (any item where heroes array contains Karnok):');
const karnokItems = items.filter(i => i.heroes?.includes('Karnok'));
karnokItems.forEach(i => console.log(`  - ${i.name} | heroes=${JSON.stringify(i.heroes)}`));

// 3. Items sharing heroes (multi-hero items that include Karnok)
const multi = items.filter(i => (i.heroes?.length || 0) > 1);
console.log(`\nItems shared between multiple heroes: ${multi.length}`);
console.log('First 10 examples:');
multi.slice(0, 10).forEach(i => console.log(`  ${i.name}: ${i.heroes.join('+')}`));

// 4. Check unique sets of heroes lists to detect any hidden hero codes
const heroSets = new Set();
for (const it of items) {
  heroSets.add((it.heroes || []).sort().join(','));
}
console.log('\nUnique hero combinations:');
[...heroSets].sort().forEach(s => console.log(`  [${s}]`));
