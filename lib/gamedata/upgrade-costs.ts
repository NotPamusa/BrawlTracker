import type { BrawlerUpgradeCosts } from "./types";

/**
 * Per-brawler upgrade costs.
 * Power 1→11: 7,765 coins + 3,740 power points
 * Gadgets: 1,000 coins each (2 per brawler)
 * Star Powers: 2,000 coins each (2 per brawler)
 * Gears: 1,000 coins each (2 per brawler)
 * Hypercharge: 5,000 coins (1 per brawler)
 *
 * Total per brawler (fully maxed): ~17,765 coins + 3,740 PP
 */
export const BRAWLER_UPGRADE_COSTS: BrawlerUpgradeCosts = {
  coinsForLevels: 7765,
  powerPointsForLevels: 3740,
  gadgetCost: 1000,
  starPowerCost: 2000,
  gearCost: 1000,
  hyperchargeCost: 5000,
};

/**
 * Coins breakdown per power level upgrade.
 * Index 0 = cost to go from power 1 to power 2.
 */
export const COINS_PER_LEVEL: number[] = [
  20,   // 1 → 2
  35,   // 2 → 3
  75,   // 3 → 4
  140,  // 4 → 5
  290,  // 5 → 6
  480,  // 6 → 7
  800,  // 7 → 8
  1250, // 8 → 9
  1875, // 9 → 10
  2800, // 10 → 11
];

/**
 * Power points breakdown per power level upgrade.
 * Index 0 = PP to go from power 1 to power 2.
 */
export const PP_PER_LEVEL: number[] = [
  20,   // 1 → 2
  30,   // 2 → 3
  50,   // 3 → 4
  80,   // 4 → 5
  130,  // 5 → 6
  210,  // 6 → 7
  340,  // 7 → 8
  550,  // 8 → 9
  890,  // 9 → 10
  1440, // 10 → 11
];

/**
 * Total coins needed to max a single brawler from scratch.
 * Includes levels + 2 gadgets + 2 star powers + 2 gears + 1 hypercharge.
 */
export const TOTAL_COINS_PER_BRAWLER =
  BRAWLER_UPGRADE_COSTS.coinsForLevels +
  BRAWLER_UPGRADE_COSTS.gadgetCost * 2 +
  BRAWLER_UPGRADE_COSTS.starPowerCost * 2 +
  BRAWLER_UPGRADE_COSTS.gearCost * 2 +
  BRAWLER_UPGRADE_COSTS.hyperchargeCost;

/** Total power points needed to max a single brawler from scratch. */
export const TOTAL_PP_PER_BRAWLER = BRAWLER_UPGRADE_COSTS.powerPointsForLevels;
