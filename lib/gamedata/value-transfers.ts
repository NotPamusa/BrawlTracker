import type { ValueTransfer } from "./types";

/**
 * Conversion table: how many base resources 1 unit of each item yields.
 * Data sourced from IncomeData.csv — ValueTransfer section.
 *
 * Example: 1 Chaos Drop = 324 coins + 59 PP + 53 credits + 0 bling.
 */
export const VALUE_TRANSFERS: Record<string, ValueTransfer> = {
  gems: { coins: 10, powerPoints: 10, credits: 0, bling: 0 },
  brawlerKey: { coins: 0, powerPoints: 0, credits: 950, bling: 0 },
  resourceKey: { coins: 0, powerPoints: 2000, credits: 0, bling: 0 },
  buffieKey: { coins: 1000, powerPoints: 2000, credits: 0, bling: 0 },
  starrDrop: { coins: 70, powerPoints: 14, credits: 9, bling: 0 },
  epicDrop: { coins: 70, powerPoints: 14, credits: 9, bling: 0 },
  mythicDrop: { coins: 70, powerPoints: 14, credits: 9, bling: 0 },
  legendaryDrop: { coins: 70, powerPoints: 14, credits: 9, bling: 0 },
  chaosDrop: { coins: 324, powerPoints: 59, credits: 53, bling: 0 },
  hyperchargeDrop: { coins: 5000, powerPoints: 0, credits: 0, bling: 0 },
  rankedDrop: { coins: 0, powerPoints: 0, credits: 0, bling: 100 },
};
