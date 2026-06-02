// Probe bazaarforge.gg's Supabase REST API for fresh build & item data.
// Uses public anon key extracted from their JS bundle.

const SUPABASE_URL = 'https://cwlgghqlqvpbmfuvkvle.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bGdnaHFscXZwYm1mdXZrdmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODIzNDYsImV4cCI6MjA3OTY1ODM0Nn0.fuVBdRQ1rMPerBGnlS08FLOvZKSlICwtJq1WKEj7YA8';

const headers = {
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Prefer': 'count=exact'
};

async function probe(path) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  try {
    const res = await fetch(url, { headers });
    const ct = res.headers.get('content-type');
    const total = res.headers.get('content-range');
    const text = await res.text();
    console.log(`[${res.status}] ${path}`);
    console.log(`  Content-Range: ${total}`);
    if (ct?.includes('json')) {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [data];
      console.log(`  Got ${arr.length} rows`);
      if (arr.length > 0) {
        console.log(`  Sample keys: ${Object.keys(arr[0]).slice(0, 25).join(', ')}`);
        const sample = JSON.stringify(arr[0], null, 2).slice(0, 800);
        console.log(`  Sample row: ${sample}`);
      }
    } else {
      console.log(`  Non-JSON: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    console.log(`  ERR ${err.message}`);
  }
  console.log();
}

// Probe key tables
await probe('items?limit=2');
await probe('builds?limit=2&order=created_at.desc');
await probe('scraped_builds?limit=2&order=created_at.desc');
await probe('heroes?limit=20');
await probe('news_posts?limit=2&order=created_at.desc');
await probe('changelogs?limit=2&order=created_at.desc');

// Hero filter check on items
console.log('=== Items by hero ===');
await probe('items?hero=eq.karnok&limit=5');
await probe('items?select=hero,id&hero=eq.karnok');

// Recent builds count
console.log('=== Recent builds within last 30 days ===');
const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
await probe(`builds?created_at=gte.${cutoff}&limit=5&order=created_at.desc`);
await probe(`scraped_builds?created_at=gte.${cutoff}&limit=5&order=created_at.desc`);
