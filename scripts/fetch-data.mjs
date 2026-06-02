// Fetch latest data from howbazaar.gg + bazaarplusplus Chinese dictionary
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw');
mkdirSync(RAW, { recursive: true });

const ENDPOINTS = {
  items: 'https://www.howbazaar.gg/api/items',
  skills: 'https://www.howbazaar.gg/api/skills',
  merchants: 'https://www.howbazaar.gg/api/merchants',
  bpp_card_dict: 'https://bpp-static.bazaarplusplus.com/card_dict_with_url.json'
};

for (const [name, url] of Object.entries(ENDPOINTS)) {
  process.stdout.write(`Fetching ${name}... `);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BazaarCodex/0.2 (personal-tool)' }
    });
    if (!res.ok) {
      console.log(`FAIL ${res.status}`);
      continue;
    }
    const text = await res.text();
    writeFileSync(join(RAW, `${name}.json`), text);
    console.log(`OK ${text.length} bytes`);
  } catch (err) {
    console.log(`ERR ${err.message}`);
  }
}
