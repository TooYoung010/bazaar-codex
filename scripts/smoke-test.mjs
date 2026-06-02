// Smoke test the production site through bazaarwinner.com
const HOST = 'https://bazaarwinner.com';
const tests = [
  ['/', '首页'],
  ['/news', '新闻'],
  ['/builds', '牌组库'],
  ['/hero/karnok', '卡诺克'],
  ['/hero/vanessa', '凡妮莎'],
  ['/item/abacus', '物品·算盘'],
  ['/ranking', '排位'],
];

console.log('Testing', HOST, '...\n');
for (const [path, name] of tests) {
  const url = HOST + path;
  const t0 = Date.now();
  try {
    const r = await fetch(url, { redirect: 'follow' });
    const elapsed = Date.now() - t0;
    const cfRay = r.headers.get('cf-ray') || '-';
    const cfCache = r.headers.get('cf-cache-status') || '-';
    console.log(
      `${name.padEnd(12)} ${path.padEnd(20)} ${r.status}  ${elapsed}ms  ${cfRay.split('-')[1] || cfRay}  ${cfCache}`
    );
  } catch (e) {
    console.log(`${name.padEnd(12)} ${path.padEnd(20)} ERR ${e.message}`);
  }
}
