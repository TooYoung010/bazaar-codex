// Transform raw howbazaar.gg JSON into site-ready format with:
//   - hero classification (incl. Common = Neutral)
//   - earliest day estimation from startingTier
//   - merchant source mapping
//   - Chinese name translation (from BPP card_dict)
//   - thumbnail image url (howbazaar CDN by item id)
//   - extra items reconstructed from bazaar-builds.net usage (Karnok + small fillers)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RAW = join(ROOT, 'data', 'raw');
const OUT = join(ROOT, 'src', 'data');
mkdirSync(OUT, { recursive: true });

const itemsRaw = JSON.parse(readFileSync(join(RAW, 'items.json'), 'utf8'));
const skillsRaw = JSON.parse(readFileSync(join(RAW, 'skills.json'), 'utf8'));
const merchantsRaw = JSON.parse(readFileSync(join(RAW, 'merchants.json'), 'utf8'));

let bppDict = {};
const bppPath = join(RAW, 'bpp_card_dict.json');
if (existsSync(bppPath)) bppDict = JSON.parse(readFileSync(bppPath, 'utf8'));

let extraItems = [];
const extrasPath = join(RAW, 'extra_items.json');
if (existsSync(extrasPath)) extraItems = JSON.parse(readFileSync(extrasPath, 'utf8'));

const overridesPath = join(ROOT, 'src', 'data', 'translations.override.json');
let overrides = {};
if (existsSync(overridesPath)) overrides = JSON.parse(readFileSync(overridesPath, 'utf8'));

// --- Mapping tables ---
const HERO_CN = {
  Vanessa: '凡妮莎', Dooley: '杜利', Pygmalien: '皮格马利安',
  Mak: '马克', Jules: '朱尔斯', Stelle: '斯黛拉',
  Karnok: '卡诺克', Common: '中立'
};
const HERO_TITLE = {
  Vanessa: '海盗', Dooley: '机器人', Pygmalien: '雕塑师',
  Mak: '医生', Jules: '商人', Stelle: '星河',
  Karnok: '猎人', Common: ''
};
const HERO_KEY = {
  Vanessa: 'vanessa', Dooley: 'dooley', Pygmalien: 'pygmalien',
  Mak: 'mak', Jules: 'jules', Stelle: 'stelle',
  Karnok: 'karnok', Common: 'common'
};

const TIER_FIRST_DAY = {
  Bronze: 1, Silver: 3, Gold: 5, Diamond: 8, Legendary: 10
};
const TIER_CN = {
  Bronze: '青铜', Silver: '白银', Gold: '黄金', Diamond: '钻石', Legendary: '传说'
};
const SIZE_CN = { Small: '小', Medium: '中', Large: '大' };

const IMG_BASE = 'https://howbazaar-images.b-cdn.net/images';
function imageUrl(type, id) { return `${IMG_BASE}/${type}/${id}.avif`; }

function translateName(item) {
  if (overrides[item.id]) return overrides[item.id];
  const entry = bppDict[item.id];
  if (entry?.name?.['zh-CN']) return entry.name['zh-CN'];
  return null;
}

const merchants = merchantsRaw.data.map(m => ({
  id: m.id,
  name: m.name,
  description: m.description,
  heroes: m.heroes || [],
  filters: m.filters || {}
}));

function merchantSells(merchant, item) {
  const f = merchant.filters || {};
  if (f.heroes && f.heroes.length > 0) {
    const intersects = item.heroes.some(h => f.heroes.includes(h));
    if (!intersects) return false;
  }
  if (f.sizes && f.sizes.length > 0 && !f.sizes.includes(item.size)) return false;
  if (f.tiers && f.tiers.length > 0 && !f.tiers.includes(item.startingTier)) return false;
  if (f.tagStates) {
    const onTags = Object.entries(f.tagStates).filter(([, v]) => v === 'on').map(([k]) => k);
    const offTags = Object.entries(f.tagStates).filter(([, v]) => v === 'off').map(([k]) => k);
    const allTags = [...(item.tags || []), ...(item.hiddenTags || [])];
    if (onTags.length > 0 && !onTags.some(t => allTags.includes(t))) return false;
    if (offTags.length > 0 && offTags.some(t => allTags.includes(t))) return false;
  }
  if (merchant.heroes && merchant.heroes.length > 0) {
    if (merchant.heroes.includes('Common')) return true;
    const intersects = item.heroes.some(h => merchant.heroes.includes(h));
    if (!intersects && !item.heroes.includes('Common')) return false;
  }
  return true;
}

function transformItem(raw) {
  const heroPrimary = raw.heroes?.[0] || 'Common';
  const earliestDay = TIER_FIRST_DAY[raw.startingTier] ?? 1;
  const nameCn = translateName(raw);

  const tierData = [];
  for (const tier of ['Bronze', 'Silver', 'Gold', 'Diamond', 'Legendary']) {
    const t = raw.tiers?.[tier];
    if (t && t.tooltips && t.tooltips.length > 0) {
      tierData.push({ tier, tierCn: TIER_CN[tier], tooltips: t.tooltips });
    }
  }

  const sources = merchants
    .filter(m => merchantSells(m, raw))
    .map(m => ({ id: m.id, name: m.name, description: m.description }));

  const combatEncounters = (raw.combatEncounters || []).map(c => ({
    name: c.cardName || c.name || '未知',
    day: c.day ?? null
  }));

  return {
    id: raw.id,
    name: raw.name,
    nameCn,
    nameDisplay: nameCn || raw.name,
    image: imageUrl('items', raw.id),
    heroes: raw.heroes || ['Common'],
    heroPrimary,
    heroPrimaryCn: HERO_CN[heroPrimary] || heroPrimary,
    heroTitle: HERO_TITLE[heroPrimary] || '',
    heroKey: HERO_KEY[heroPrimary] || 'common',
    size: raw.size,
    sizeCn: SIZE_CN[raw.size] || raw.size,
    startingTier: raw.startingTier,
    startingTierCn: TIER_CN[raw.startingTier] || raw.startingTier,
    earliestDay,
    tags: raw.tags || [],
    hiddenTags: raw.hiddenTags || [],
    tierData,
    unifiedTooltips: raw.unifiedTooltips || [],
    enchantments: (raw.enchantments || []).map(e => ({
      type: e.type,
      tooltips: e.tooltips || []
    })),
    sources,
    combatEncounters,
    dataSource: 'howbazaar' // mark canonical items
  };
}

// --- Build items list, merging extras ---
const items = itemsRaw.data.map(transformItem);
const existingIds = new Set(items.map(i => i.id));

let extraAdded = 0;
for (const ex of extraItems) {
  if (existingIds.has(ex.id)) continue;
  const hero = ex.inferredHero;
  // Skip if hero is "Multi" or low-confidence (we already filtered to >= 0.5)
  if (!HERO_CN[hero]) continue;
  const size = ex.size || 'Medium';
  // Use BPP webp image if available, else placeholder
  const image = ex.image_url || `https://bpp-static.bazaarplusplus.com/webp/${ex.id}.webp`;
  items.push({
    id: ex.id,
    name: ex.name,
    nameCn: ex.nameCn || null,
    nameDisplay: ex.nameCn || ex.name,
    image,
    heroes: [hero],
    heroPrimary: hero,
    heroPrimaryCn: HERO_CN[hero],
    heroTitle: HERO_TITLE[hero] || '',
    heroKey: HERO_KEY[hero],
    size,
    sizeCn: SIZE_CN[size] || size,
    startingTier: 'Gold',          // Unknown tier -- assume Gold (most items are)
    startingTierCn: '黄金',
    earliestDay: 5,
    tags: [],
    hiddenTags: [],
    tierData: [],                  // no tooltip data for these
    unifiedTooltips: [],
    enchantments: [],
    sources: [],                   // no merchant info
    combatEncounters: [],
    dataSource: 'inferred',        // mark inferred items
    inferredFrom: `bazaar-builds.net (${ex.totalUsage} 套牌组使用，置信度 ${ex.confidence})`
  });
  extraAdded++;
}

// --- Skills ---
const skills = skillsRaw.data.map(s => {
  const nameCn = (overrides[s.id] || bppDict[s.id]?.name?.['zh-CN']) || null;
  return {
    id: s.id,
    name: s.name,
    nameCn,
    nameDisplay: nameCn || s.name,
    image: imageUrl('skills', s.id),
    startingTier: s.startingTier,
    startingTierCn: TIER_CN[s.startingTier] || s.startingTier,
    earliestDay: TIER_FIRST_DAY[s.startingTier] ?? 1,
    heroes: s.heroes || ['Common'],
    unifiedTooltips: s.unifiedTooltips || [],
    tags: s.tags || []
  };
});

// Group items by primary hero
const heroGroups = {};
for (const item of items) {
  const k = item.heroPrimary;
  if (!heroGroups[k]) heroGroups[k] = [];
  heroGroups[k].push(item.id);
}

const heroOrder = ['Vanessa', 'Dooley', 'Pygmalien', 'Mak', 'Jules', 'Stelle', 'Karnok', 'Common'];
const heroes = heroOrder.filter(h => heroGroups[h]).map(h => ({
  key: HERO_KEY[h],
  id: h,
  name: HERO_CN[h],
  nameEn: h,
  title: HERO_TITLE[h],
  itemCount: heroGroups[h].length
}));

const translatedCount = items.filter(i => i.nameCn).length;
const inferredCount = items.filter(i => i.dataSource === 'inferred').length;

writeFileSync(join(OUT, 'items.json'), JSON.stringify(items));
writeFileSync(join(OUT, 'skills.json'), JSON.stringify(skills));
writeFileSync(join(OUT, 'heroes.json'), JSON.stringify(heroes, null, 2));
writeFileSync(join(OUT, 'merchants.json'), JSON.stringify(merchants, null, 2));

console.log(`Items written: ${items.length}`);
console.log(`  from howbazaar:  ${items.length - inferredCount}`);
console.log(`  inferred extras: ${inferredCount} (added ${extraAdded})`);
console.log(`  with Chinese name: ${translatedCount} / ${items.length}`);
console.log(`Skills written: ${skills.length}`);
console.log(`Heroes:`, heroes.map(h => `${h.name}(${h.itemCount})`).join(' '));
