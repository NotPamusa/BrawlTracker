import type { IncomeSource } from "./types";

/**
 * Brawl Pass income per season (30.4 days).
 * Data sourced from IncomeData.csv — Brawl Pass section.
 */
export const BRAWL_PASS_INCOME: Record<"free" | "regular" | "plus", IncomeSource> = {
  free: {
    label: "Brawl Pass (Free)",
    resources: { coins: 12500, powerPoints: 3600, credits: 1400, bling: 200 },
    specialItems: {
      gems: 50,
      brawlerKey: 0,
      resourceKey: 1,
      buffieKey: 0,
      starrDrop: 18,
      epicDrop: 0,
      mythicDrop: 0,
      legendaryDrop: 1,
      chaosDrop: 6,
      hyperchargeDrop: 0,
      rankedDrop: 0,
    },
    periodDays: 30.4,
    costEuros: 0,
  },
  regular: {
    label: "Brawl Pass (Regular)",
    resources: { coins: 22000, powerPoints: 6100, credits: 3900, bling: 3400 },
    specialItems: {
      gems: 100,
      brawlerKey: 1,
      resourceKey: 2,
      buffieKey: 0,
      starrDrop: 0,
      epicDrop: 0,
      mythicDrop: 0,
      legendaryDrop: 0,
      chaosDrop: 0,
      hyperchargeDrop: 0,
      rankedDrop: 0,
    },
    periodDays: 30.4,
    costEuros: 6.49,
  },
  plus: {
    label: "Brawl Pass (Plus)",
    resources: { coins: 25000, powerPoints: 7600, credits: 3900, bling: 4900 },
    specialItems: {
      gems: 200,
      brawlerKey: 2,
      resourceKey: 3,
      buffieKey: 1,
      starrDrop: 0,
      epicDrop: 0,
      mythicDrop: 0,
      legendaryDrop: 0,
      chaosDrop: 0,
      hyperchargeDrop: 0,
      rankedDrop: 0,
    },
    periodDays: 30.4,
    costEuros: 9.99,
  },
};

/**
 * Tail reward (per tail in Brawl Pass).
 * Small per-tail bonus, not per-season.
 */
export const BRAWL_PASS_TAIL_REWARD: IncomeSource = {
  label: "Brawl Pass Tail Reward",
  resources: { coins: 50, powerPoints: 20, credits: 20, bling: 20 },
  specialItems: {
    gems: 0,
    brawlerKey: 0,
    resourceKey: 0,
    buffieKey: 0,
    starrDrop: 0,
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
