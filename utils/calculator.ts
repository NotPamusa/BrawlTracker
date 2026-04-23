import { PlayerStats } from './brawlAPI';
import gameMetadata from "@/data/gameMetadata.json";
import brawlerRarities from "@/data/brawlers.json";

const {
  ppToLevel: PP_TO_LEVEL,
  coinsToLevel: COINS_TO_LEVEL,
  ppMax: PP_MAX,
  coinsMax: COINS_MAX,
  costGadget: COST_GADGET,
  costStarPower: COST_STAR_POWER,
  costGear: COST_GEAR,
  costHypercharge: COST_HYPERCHARGE,
  costBuffieCoins: COST_BUFFIE_COINS,
  costBuffiePP: COST_BUFFIE_PP,
  costCommonBrawler: COST_COMMON,
  costRareBrawler: COST_RARE,
  costSuperRareBrawler: COST_SUPER_RARE,
  costEpicBrawler: COST_EPIC,
  costMythicBrawler: COST_MYTHIC,
  costLegendaryBrawler: COST_LEGENDARY,
  costUltraLegendaryBrawler: COST_ULTRA_LEGENDARY
} = gameMetadata;

const RARITY_COSTS: Record<string, number> = {
  "Common": COST_COMMON,
  "Rare": COST_RARE,
  "Super Rare": COST_SUPER_RARE,
  "Epic": COST_EPIC,
  "Mythic": COST_MYTHIC,
  "Legendary": COST_LEGENDARY,
  "Ultra Legendary": COST_ULTRA_LEGENDARY
};

export interface CalculationResult {
  daysCoins: number;
  daysPowerPoints: number;
  daysCredits: number;
  maxDays: number;
  nMaxCoins: number;
  currentCoins: number;
  nMaxPP: number;
  currentPP: number;
  nMaxCredits: number;
  currentCredits: number;
}

export interface UserSettings {
  dailyActivityDelta: number;
  challengesDelta: number;
  eventsDelta: number;
  finishQuests: boolean;
  monthlySpending: number;
  currency: string;
  moneyEfficiency: number;
  gemEfficiency: number;
  isRankedPlayer: boolean;
  esportsRewards: boolean;
  nBrawlPass_regular: number;
  nBrawlPass_plus: number;
  nRankedPass_free: number;
  nRankedPass_regular: number;
  stash: Record<string, number>;
}

export function calculateDaysToMax(
  player: PlayerStats,
  mode: 'MAX' | 'FullMAX' = 'MAX',
  settings?: UserSettings
): CalculationResult {
  let currentCoinsProgression = 0;
  let currentPPProgression = 0;
  let currentCreditsProgression = 0;

  let nMaxCoins = 0;
  let nMaxPP = 0;
  let nMaxCredits = 0;

  // 0. Calculate Credits (Brawler Unlock) progression
  const ownedBrawlerNames = new Set(player.brawlers.map(b => b.name.toUpperCase()));
  
  Object.entries(brawlerRarities).forEach(([name, rarity]) => {
    const cost = RARITY_COSTS[rarity] || 0;
    nMaxCredits += cost;
    if (ownedBrawlerNames.has(name.toUpperCase())) {
      currentCreditsProgression += cost;
    }
  });

  // Determine target item counts per brawler depending on mode
  const targetGadgets = mode === 'FullMAX' ? 2 : 1;
  const targetSPs = mode === 'FullMAX' ? 2 : 1;
  const targetGears = 2;
  const targetHC = 1;
  const targetBuffies = 3;

  let gadgetsSurplus = 0;
  let spsSurplus = 0;
  let gearsSurplus = 0;
  let hcSurplus = 0;
  let buffiesSurplus = 0;

  for (const brawler of player.brawlers) {
    // Add coins/pp spent to current level
    const lvlIdx = brawler.power - 1;
    currentPPProgression += PP_TO_LEVEL[lvlIdx] ?? 0;
    currentCoinsProgression += COINS_TO_LEVEL[lvlIdx] ?? 0;

    // Add cost of items (<item>Owned is number of this item the brawler has, counting up to the max amount we care about)
    // Also count how many surplus items player
    const gadgetsOwned = Math.min(brawler.gadgets?.length ?? 0, targetGadgets);
    gadgetsSurplus += Math.max(0, (brawler.gadgets?.length ?? 0) - targetGadgets);

    const spOwned = Math.min(brawler.starPowers?.length ?? 0, targetSPs);
    spsSurplus += Math.max(0, (brawler.starPowers?.length ?? 0) - targetSPs);

    const gearsOwned = Math.min(brawler.gears?.length ?? 0, targetGears);
    gearsSurplus += Math.max(0, (brawler.gears?.length ?? 0) - targetGears);

    const hcOwned = Math.min(brawler.hyperCharges?.length ?? 0, targetHC);
    hcSurplus += Math.max(0, (brawler.hyperCharges?.length ?? 0) - targetHC);

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

  // Capping the total buffies to what is released in-game
  const totalTargetBuffies = mode === 'FullMAX' ? gameMetadata.totalBrawlers * targetBuffies : gameMetadata.releasedBuffieBrawlerCount * targetBuffies;

  nMaxCoins += totalTargetBuffies * COST_BUFFIE_COINS;
  nMaxPP += totalTargetBuffies * COST_BUFFIE_PP;

  // Linear progression rate: m
  const mCoins = 1000;
  const mPP = 1000;
  const mCredits = 250; // Placeholder until income models are linked

  const requiredCoins = Math.max(0, nMaxCoins - currentCoinsProgression);
  const requiredPP = Math.max(0, nMaxPP - currentPPProgression);
  const requiredCredits = Math.max(0, nMaxCredits - currentCreditsProgression);

  const daysCoins = requiredCoins / mCoins;
  const daysPowerPoints = requiredPP / mPP;
  const daysCredits = requiredCredits / mCredits;

  const maxDays = Math.ceil(Math.max(daysCoins, daysPowerPoints, daysCredits));

  return {
    daysCoins: Math.ceil(daysCoins),
    daysPowerPoints: Math.ceil(daysPowerPoints),
    daysCredits: Math.ceil(daysCredits),
    maxDays,
    nMaxCoins,
    currentCoins: currentCoinsProgression,
    nMaxPP,
    currentPP: currentPPProgression,
    nMaxCredits,
    currentCredits: currentCreditsProgression
  };
}
