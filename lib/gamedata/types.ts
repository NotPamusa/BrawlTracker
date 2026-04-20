/**
 * Core resource types tracked for progression.
 * Credits and Bling are tracked internally for long-term calculations
 * but only coins and power points are user-facing inputs.
 */
export interface Resources {
  coins: number;
  powerPoints: number;
  credits: number;
  bling: number;
}

/** Gems and special items that can be converted to resources */
export interface SpecialItems {
  gems: number;
  brawlerKey: number;
  resourceKey: number;
  buffieKey: number;
  starrDrop: number;
  epicDrop: number;
  mythicDrop: number;
  legendaryDrop: number;
  chaosDrop: number;
  hyperchargeDrop: number;
  rankedDrop: number;
}

/** Combined income from a single source (pass tier, daily play, etc.) */
export interface IncomeSource {
  label: string;
  resources: Resources;
  specialItems: SpecialItems;
  periodDays: number; // Duration of the income period
  costEuros: number;
}

/** Daily income rates (resources per day) */
export interface DailyIncome {
  coins: number;
  powerPoints: number;
  credits: number;
  bling: number;
}

/** Per-brawler upgrade costs */
export interface BrawlerUpgradeCosts {
  /** Coins to go from power 1 to power 11 */
  coinsForLevels: number;
  /** Power points to go from power 1 to power 11 */
  powerPointsForLevels: number;
  /** Coins per gadget (max 2) */
  gadgetCost: number;
  /** Coins per star power (max 2) */
  starPowerCost: number;
  /** Coins per gear (max 2) */
  gearCost: number;
  /** Coins for hypercharge */
  hyperchargeCost: number;
}

/** Value conversion: how many base resources does 1 unit of a special item yield */
export interface ValueTransfer {
  coins: number;
  powerPoints: number;
  credits: number;
  bling: number;
}

/** Brawl Pass tier options */
export type BrawlPassTier = "free" | "regular" | "plus";

/** Ranked Pass tier options */
export type RankedPassTier = "free" | "pro";

/** Player activity level */
export type ActivityLevel =
  | "daily"
  | "every2days"
  | "weekends"
  | "seasonEnd"
  | "onceAWeek";

/** Ranked play frequency */
export type RankedFrequency =
  | "daily"
  | "every2days"
  | "untilDesiredRank"
  | "never";

/** Gem usage strategy */
export type GemUsage =
  | "skinsMostly"
  | "skinsAndResources"
  | "goodValueOffers"
  | "onlyBestOffers";
