// Deeper probe: Karnok items + builds counts in bazaarforge
const SUPABASE_URL = 'https://cwlgghqlqvpbmfuvkvle.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bGdnaHFscXZwYm1mdXZrdmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODIzNDYsImV4cCI6MjA3OTY1ODM0Nn0.fuVBdRQ1rMPerBGnlS08FLOvZKSlICwtJq1WKEj7YA8';
const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  Prefer: 'count=exact'
};

async function q(path) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, { headers });
  const range = res.headers.get('content-range');
  const data = await res.json();
  return { range, data };
}

// Items by hero
console.log('=== Items count by hero ===');
for (const h of ['Vanessa','Dooley','Pygmalien','Mak','Jules','Stelle','Karnok','Common']) {
  const r = await q(`items?heroes=cs.{${h}}&select=id`);
  console.log(`  ${h}: ${r.range?.split('/')[1] ?? r.data.length}`);
}

// Heroes table summary
console.log('\n=== Heroes table ===');
const heroes = await q('heroes?select=name,build_count,build_count_all,sum_wins&order=build_count.desc');
heroes.data.forEach(h => console.log(`  ${h.name}: builds=${h.build_count}/${h.build_count_all} wins=${h.sum_wins}`));

// Builds count by hero (last 30 days)
console.log('\n=== Builds in last 30 days by hero ===');
const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
for (const h of ['Vanessa','Dooley','Pygmalien','Mak','Jules','Stelle','Karnok']) {
  const r = await q(`builds?hero=eq.${h}&created_at=gte.${cutoff}&select=id`);
  console.log(`  ${h}: ${r.range?.split('/')[1] ?? r.data.length}`);
}

// Total builds
console.log('\n=== Total builds & date span ===');
const tr = await q('builds?select=id&limit=1');
console.log(`Total: ${tr.range?.split('/')[1]}`);
const newest = await q('builds?select=created_at,title&order=created_at.desc&limit=5');
console.log('Newest 5:');
newest.data.forEach(b => console.log(`  ${b.created_at}  ${b.title?.slice(0, 70)}`));
const oldest = await q('builds?select=created_at,title&order=created_at.asc&limit=3');
console.log('Oldest 3:');
oldest.data.forEach(b => console.log(`  ${b.created_at}  ${b.title?.slice(0, 70)}`));

// Also check Karnok builds specifically
console.log('\n=== Karnok builds (last 60 days) ===');
const cutoff2 = new Date(Date.now() - 60 * 86400000).toISOString();
const k = await q(`builds?hero=eq.Karnok&created_at=gte.${cutoff2}&select=created_at,title,user_name,wins,likes&order=created_at.desc&limit=10`);
console.log(`Total karnok last 60d: ${k.range?.split('/')[1]}`);
k.data.forEach(b => console.log(`  ${b.created_at}  user=${b.user_name} wins=${b.wins} likes=${b.likes}  ${b.title?.slice(0, 60)}`));

// Build sample with item_ids
console.log('\n=== Build with item_ids non-null (sample) ===');
const w = await q('builds?item_ids=not.is.null&select=id,title,hero,item_ids,wins&limit=3');
console.log(JSON.stringify(w.data, null, 2));
