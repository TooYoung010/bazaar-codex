// Check what's in BPP dict but missing from howbazaar
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw');

const items = JSON.parse(readFileSync(join(RAW, 'items.json'), 'utf8')).data;
const skills = JSON.parse(readFileSync(join(RAW, 'skills.json'), 'utf8')).data;
const bpp = JSON.parse(readFileSync(join(RAW, 'bpp_card_dict.json'), 'utf8'));

const itemIds = new Set(items.map(i => i.id));
const skillIds = new Set(skills.map(s => s.id));

// Items in BPP but NOT in howbazaar items+skills
const orphaned = [];
for (const [id, entry] of Object.entries(bpp)) {
  if (!itemIds.has(id) && !skillIds.has(id)) {
    orphaned.push({ id, ...entry });
  }
}

console.log(`BPP entries: ${Object.keys(bpp).length}`);
console.log(`howbazaar items: ${items.length}`);
console.log(`howbazaar skills: ${skills.length}`);
console.log(`In BPP but NOT in howbazaar items+skills: ${orphaned.length}`);
console.log('\n=== First 30 orphaned (might be Karnok or hero/event content) ===');
orphaned.slice(0, 30).forEach(o => {
  const en = o.name?.['en-US'] || '?';
  const cn = o.name?.['zh-CN'] || '?';
  console.log(`  ${o.id}  size=${o.size||'?'}  en="${en}"  cn="${cn}"`);
});

// Check by size pattern (skills/items have specific sizes; events/heroes might differ)
console.log('\n=== Orphaned by size ===');
const bySize = {};
for (const o of orphaned) {
  const k = o.size || 'NO_SIZE';
  bySize[k] = (bySize[k] || 0) + 1;
}
console.log(bySize);

// Find Karnok hero presence in BPP
console.log('\n=== Look for Karnok-themed entries (search en/cn for hunter words) ===');
const huntWords = ['hunter', 'karnok', '猎人', '卡诺克'];
for (const [id, e] of Object.entries(bpp)) {
  const en = (e.name?.['en-US'] || '').toLowerCase();
  const cn = e.name?.['zh-CN'] || '';
  if (huntWords.some(w => en.includes(w.toLowerCase()) || cn.includes(w))) {
    console.log(`  ${id}  cn="${cn}" en="${e.name?.['en-US']}"`);
  }
}
