import type { IncomeSource } from "./types";

/**
 * Ranked Pass income per season (91.3 days / ~3 months).
 * Data sourced from IncomeData.csv — Ranked Pass section.
 */
export const RANKED_PASS_INCOME: Record<"free" | "pro", IncomeSource> = {
  free: {
    label: "Ranked Pass (Free)",
    resources: { coins: 0, powerPoints: 0, credits: 0, bling: 0 },
    specialItems: {
      gems: 50,
      brawlerKey: 0,
      resourceKey: 0,
      buffieKey: 0,
      starrDrop: 0,
      epicDrop: 0,
      mythicDrop: 8,
      legendaryDrop: 8,
      chaosDrop: 0,
      hyperchargeDrop: 1,
      rankedDrop: 34,
    },
    periodDays: 91.3,
    costEuros: 0,
  },
  pro: {
    label: "Ranked Pass (Pro)",
    resources: { coins: 10000, powerPoints: 0, credits: 0, bling: 0 },
    specialItems: {
      gems: 650,
      brawlerKey: 0,
      resourceKey: 0,
      buffieKey: 0,
      starrDrop: 0,
      epicDrop: 0,
      mythicDrop: 8,
      legendaryDrop: 8,
      chaosDrop: 0,
      hyperchargeDrop: 1,
      rankedDrop: 34,
    },
    periodDays: 91.3,
    costEuros: 17.99,
  },
};

/** Ranked Pass tail rewards */
export const RANKED_PASS_TAIL_REWARD: IncomeSource = {
  label: "Ranked Pass Tail Reward",
  resources: { coins: 0, powerPoints: 0, credits: 0, bling: 0 },
  specialItems: {
    gems: 0,
    brawlerKey: 0,
    resourceKey: 0,
    buffieKey: 0,
    starrDrop: 0,
    epicDrop: 0,
    mythicDrop: 0,
    legendaryDrop: 1,
    chaosDrop: 0,
    hyperchargeDrop: 0,
    rankedDrop: 0,
  },
  periodDays: 91.3,
  costEuros: 0,
};
