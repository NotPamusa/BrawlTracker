import type { IncomeSource, DailyIncome } from "./types";

/**
 * Daily play income (casual play — 1 day period).
 * Data sourced from IncomeData.csv — Daily Play section.
 */
export const DAILY_PLAY_INCOME: IncomeSource = {
  label: "Daily Play (Casual)",
  resources: { coins: 20, powerPoints: 15, credits: 5, bling: 0 },
  specialItems: {
    gems: 0,
    brawlerKey: 0,
    resourceKey: 0,
    buffieKey: 0,
    starrDrop: 5,
    epicDrop: 0,
    mythicDrop: 0,
    legendaryDrop: 0,
    chaosDrop: 1,
    hyperchargeDrop: 0,
    rankedDrop: 0,
  },
  periodDays: 1,
  costEuros: 0,
};

/**
 * Event play income (yearly events, normalized to 365 days).
 * Data sourced from IncomeData.csv — Event Play section.
 */
export const EVENT_PLAY_INCOME: IncomeSource = {
  label: "Event Play (Yearly)",
  resources: { coins: 24000, powerPoints: 18000, credits: 10000, bling: 2000 },
  specialItems: {
    gems: 100,
    brawlerKey: 0,
    resourceKey: 0,
    buffieKey: 0, // 6 buffies listed, but as items not keys
    starrDrop: 0,
    epicDrop: 0,
    mythicDrop: 0,
    legendaryDrop: 0,
    chaosDrop: 0,
    hyperchargeDrop: 0,
    rankedDrop: 0,
  },
  periodDays: 365,
  costEuros: 0,
};

/**
 * Mega Pig income (monthly, 30.4 days).
 * Data sourced from IncomeData.csv — Mega Pig section.
 */
export const MEGA_PIG_INCOME: IncomeSource = {
  label: "Mega Pig (Monthly)",
  resources: { coins: 0, powerPoints: 0, credits: 0, bling: 0 },
  specialItems: {
    gems: 0,
    brawlerKey: 0,
    resourceKey: 0,
    buffieKey: 0,
    starrDrop: 20,
    epicDrop: 0,
    mythicDrop: 0,
    legendaryDrop: 0,
    chaosDrop: 0,
    hyperchargeDrop: 0,
    rankedDrop: 0,
  },
  periodDays: 30.4,
  costEuros: 0,
};

/**
 * Pre-computed daily income totals for a "typical F2P active player".
 * From IncomeData.csv — Total daily income section.
 * Used for quick estimates on the landing page.
 */
export const DEFAULT_DAILY_INCOME: DailyIncome = {
  coins: 1435,
  powerPoints: 466,
  credits: 198,
  bling: 49,
};
