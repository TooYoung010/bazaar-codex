import dns from 'node:dns/promises';

const candidates = ['bzz.gg', 'bazaar-codex.com', 'dabazha.gg', 'dabazha.com', 'bazaarcn.com', 'bzz.cn'];

for (const d of candidates) {
  try {
    const ns = await dns.resolve(d, 'NS');
    console.log(`[REGISTERED] ${d}  NS: ${ns.join(', ')}`);
  } catch (e) {
    if (e.code === 'ENOTFOUND' || e.code === 'ENODATA') {
      console.log(`[AVAILABLE]  ${d}`);
    } else {
      console.log(`[?]          ${d}  ${e.code}`);
    }
  }
}
