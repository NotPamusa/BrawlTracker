import { PlayerStats, RELEASED_BUFFIES_BRAWLER_COUNT } from './brawlAPI';

/**
 * Total power points and coins to max a brawler from level 1.
 * Example arrays of cumulative vs cost:
 * Level 1->2 => 20 PP, 20 Coins
 * ... Total PP to Level 11 = 3720
 * ... Total Coins to Level 11 = 7765
 */
const PP_TO_LEVEL = [0, 20, 50, 100, 190, 320, 530, 870, 1390, 2280, 3720];
const COINS_TO_LEVEL = [0, 20, 55, 130, 270, 560, 1040, 1840, 3090, 4965, 7765];

const PP_MAX = 3720;
const COINS_MAX = 7765;

const COST_GADGET = 1000;
const COST_STAR_POWER = 2000;
const COST_GEAR = 1000; // Simplified average. Epic gears = 1500
const COST_HYPERCHARGE = 5000;
const COST_BUFFIE_COINS = 1000;
const COST_BUFFIE_PP = 2000;

export interface CalculationResult {
  daysCoins: number;
  daysPowerPoints: number;
  maxDays: number;
  nMaxCoins: number;
  currentCoins: number;
  nMaxPP: number;
  currentPP: number;
}

export function calculateDaysToMax(player: PlayerStats, mode: 'MAX' | 'FullMAX' = 'MAX'): CalculationResult {
  let currentCoinsProgression = 0;
  let currentPPProgression = 0;

  let nMaxCoins = 0;
  let nMaxPP = 0;

  // Assuming player wants to max ALL brawlers they have currently unlocked.
  // We're ignoring the overall 86 brawlers baseline, as user requested "Sum of all brawlers"

  // Determine target item counts per brawler depending on mode
  const targetGadgets = mode === 'FullMAX' ? 2 : 1;
  const targetSPs = mode === 'FullMAX' ? 2 : 1;
  const targetGears = 2; // Always 2
  const targetHC = 1;
  const targetBuffies = 3;

  for (const brawler of player.brawlers) {
    // 1. Current state for this brawler
    const lvlIdx = brawler.power - 1;
    currentPPProgression += PP_TO_LEVEL[lvlIdx] || PP_MAX;
    currentCoinsProgression += COINS_TO_LEVEL[lvlIdx] || COINS_MAX;

    // Items unlocked limit calculation
    const gadgetsOwned = Math.min(brawler.gadgets?.length || 0, targetGadgets);
    const spOwned = Math.min(brawler.starPowers?.length || 0, targetSPs);
    const gearsOwned = Math.min(brawler.gears?.length || 0, targetGears);
    const hcOwned = Math.min(brawler.hyperCharges?.length || 0, targetHC);

    let buffiesOwnedCount = 0;
    if (brawler.buffies) {
      if (brawler.buffies.gadget) buffiesOwnedCount++;
      if (brawler.buffies.starPower) buffiesOwnedCount++;
      if (brawler.buffies.hyperCharge) buffiesOwnedCount++;
    }
    const buffiesOwned = Math.min(buffiesOwnedCount, targetBuffies);

    currentCoinsProgression += gadgetsOwned * COST_GADGET;
    currentCoinsProgression += spOwned * COST_STAR_POWER;
    currentCoinsProgression += gearsOwned * COST_GEAR;
    currentCoinsProgression += hcOwned * COST_HYPERCHARGE;
    currentCoinsProgression += buffiesOwned * COST_BUFFIE_COINS;

    currentPPProgression += buffiesOwned * COST_BUFFIE_PP;

    // 2. Max state for this brawler
    nMaxPP += PP_MAX;
    nMaxCoins += COINS_MAX;

    nMaxCoins += targetGadgets * COST_GADGET;
    nMaxCoins += targetSPs * COST_STAR_POWER;
    nMaxCoins += targetGears * COST_GEAR;
    nMaxCoins += targetHC * COST_HYPERCHARGE;
  }

  // Capping the total buffies to what is released globally
  // We assume buffies are priority-filled for brawlers the player owns.
  const applicableBrawlersForBuffies = Math.min(player.brawlers.length, RELEASED_BUFFIES_BRAWLER_COUNT);
  const totalTargetBuffies = applicableBrawlersForBuffies * targetBuffies;

  nMaxCoins += totalTargetBuffies * COST_BUFFIE_COINS;
  nMaxPP += totalTargetBuffies * COST_BUFFIE_PP;

  // Linear progression rate: m
  // The user requested for now to consider 1000 of each resource per day
  const mCoins = 1000;
  const mPP = 1000;

  // t = (n_max - n_current) / m
  // Prevent negative days
  const leftoverCoins = Math.max(0, nMaxCoins - currentCoinsProgression);
  const leftoverPP = Math.max(0, nMaxPP - currentPPProgression);

  const daysCoins = leftoverCoins / mCoins;
  const daysPowerPoints = leftoverPP / mPP;

  const maxDays = Math.ceil(Math.max(daysCoins, daysPowerPoints));

  return {
    daysCoins: Math.ceil(daysCoins),
    daysPowerPoints: Math.ceil(daysPowerPoints),
    maxDays,
    nMaxCoins,
    currentCoins: currentCoinsProgression,
    nMaxPP,
    currentPP: currentPPProgression
  };
}
