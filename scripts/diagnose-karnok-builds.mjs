// Diagnose:
// 1) Why no Karnok builds detected in /builds page
// 2) Why most data stops in early May (today is June 2, 2026)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw');

const posts = JSON.parse(readFileSync(join(RAW, 'bb_posts.json'), 'utf8'));
const cats = JSON.parse(readFileSync(join(RAW, 'bb_categories.json'), 'utf8'));
const builds = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'data', 'builds.json'), 'utf8'));

// 1. How many posts have Karnok in title?
const titleHasKarnok = posts.filter(p => p.title.rendered.toLowerCase().includes('karnok'));
console.log(`Posts with 'karnok' in title: ${titleHasKarnok.length}`);

// 2. How many posts in Karnok category (id=2175)?
const karnokCat = cats.find(c => c.name === 'Karnok');
console.log(`Karnok category: id=${karnokCat?.id} count=${karnokCat?.count}`);
const inKarnokCat = posts.filter(p => p.categories?.includes(2175));
console.log(`Posts in Karnok category: ${inKarnokCat.length}`);

// 3. After my transform, how many builds have hero=Karnok?
const karnokBuilds = builds.filter(b => b.hero === 'Karnok');
console.log(`After transform, builds with hero=Karnok: ${karnokBuilds.length}`);

// 4. Show first 5 Karnok-category posts and their final transform classification
console.log('\nFirst 5 Karnok-cat posts vs final hero:');
for (const p of inKarnokCat.slice(0, 5)) {
  const b = builds.find(x => x.id === String(p.id));
  console.log(`  "${p.title.rendered.slice(0, 80)}"`);
  console.log(`    title-detected hero=${b?.hero || 'MISSING'}`);
}

// 5. Date distribution
console.log('\n=== Post date distribution ===');
const byMonth = {};
for (const p of posts) {
  const m = p.date.slice(0, 7);
  byMonth[m] = (byMonth[m] || 0) + 1;
}
const months = Object.keys(byMonth).sort();
for (const m of months) {
  console.log(`  ${m}: ${byMonth[m]}`);
}

// 6. Latest 10 posts (most recent)
console.log('\n=== 10 most recent posts ===');
const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
for (const p of sorted.slice(0, 10)) {
  console.log(`  ${p.date}  id=${p.id}  "${p.title.rendered.slice(0, 70)}"`);
}
