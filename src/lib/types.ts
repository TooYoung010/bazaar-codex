// Shared types for transformed game data
export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Legendary';
export type Size = 'Small' | 'Medium' | 'Large';
export type HeroId =
  | 'Vanessa' | 'Dooley' | 'Pygmalien' | 'Mak' | 'Jules' | 'Stelle' | 'Karnok' | 'Common' | 'Unknown';

export interface MerchantSource {
  id: string;
  name: string;
  description: string;
}

export interface CombatEncounter {
  name: string;
  day: number | null;
}

export interface TierTooltips {
  tier: Tier;
  tierCn: string;
  tooltips: string[];
}

export interface Enchantment {
  type: string;
  tooltips: string[];
}

export interface Item {
  id: string;
  name: string;
  nameCn: string | null;
  nameDisplay: string;
  image: string;
  heroes: HeroId[];
  heroPrimary: HeroId;
  heroPrimaryCn: string;
  heroTitle: string;
  heroKey: string;
  size: Size;
  sizeCn: string;
  startingTier: Tier;
  startingTierCn: string;
  earliestDay: number;
  tags: string[];
  hiddenTags: string[];
  tierData: TierTooltips[];
  unifiedTooltips: string[];
  enchantments: Enchantment[];
  sources: MerchantSource[];
  combatEncounters: CombatEncounter[];
  dataSource?: 'howbazaar' | 'inferred';
  inferredFrom?: string;
}

export interface Hero {
  key: string;
  id: HeroId;
  name: string;
  nameEn: string;
  title: string;
  itemCount: number;
}

export interface Build {
  id: string;
  slug: string;
  name: string;
  nameCn?: string;
  hero: HeroId;
  heroName: string;
  heroKey: string;
  description: string;
  image: string | null;
  itemIds: string[];
  coreItemId?: string | null;
  author: string | null;
  result: string | null;
  wins?: number | null;
  maxHealth?: number | null;
  level?: number | null;
  gold?: number | null;
  victoryType?: string | null;
  link: string;
  createdAt: string;
  modifiedAt?: string;
  dataSource?: 'bazaar-builds' | 'bazaarforge';
}
