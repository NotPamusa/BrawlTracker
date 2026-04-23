import { PlayerStats } from './brawlAPI';
import gameMetadata from "@/data/gameMetadata.json";
import brawlerRarities from "@/data/brawlers.json";
import incomeData from "@/data/incomeSources.json";

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
  nBrawlPass_free: number;
  bscChallengeDelta: number;
  stash: Record<string, number>;
}

export interface IncomeSource {
  daysPerCycle: number;
  resources: Record<string, number>;
  modifiers?: Record<string, number>;
}

export interface DailyResources {
  coins: number;
  powerPoints: number;
  credits: number;
  gems: number;
  bling: number;
}

export function calculateDaysToMax(
  player: PlayerStats,
  mode: 'MAX' | 'FullMAX' = 'MAX',
  settings?: UserSettings
): CalculationResult {
  let currentCoinsProgression = 0;
  let currentPPProgression = 0;
  let currentCreditsProgression = 0;

  let nMaxCredits = 0;

  // Calculate Credits (Brawler Unlock) progression
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

  // Iterate through brawlers to calculate coins/PP spent. Also surplus items.
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

  }

  // Capping the total buffies to what is released in-game
  const totalTargetBuffies = mode === 'FullMAX' ? gameMetadata.totalBrawlers * targetBuffies : gameMetadata.releasedBuffieBrawlerCount * targetBuffies;

  const nMaxCoins = (COINS_MAX + COST_GADGET * targetGadgets + COST_STAR_POWER * targetSPs + COST_GEAR * targetGears + COST_HYPERCHARGE * targetHC) * gameMetadata.totalBrawlers + COST_BUFFIE_COINS * totalTargetBuffies;
  const nMaxPP = PP_MAX * gameMetadata.totalBrawlers + COST_BUFFIE_PP * totalTargetBuffies;


  // *** Linear progression rate: m ***

  let m_dailyResources = calculateDailyResources(player, settings);











  const requiredCoins = Math.max(0, nMaxCoins - currentCoinsProgression);
  const requiredPP = Math.max(0, nMaxPP - currentPPProgression);
  const requiredCredits = Math.max(0, nMaxCredits - currentCreditsProgression);

  const mCoins = m_dailyResources.coins || 1;
  const mPP = m_dailyResources.powerPoints || 1;
  const mCredits = m_dailyResources.credits || 1;

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

function calculateDailyResources(player: PlayerStats, settings?: UserSettings): DailyResources {
  const daily: DailyResources = {
    coins: 0,
    powerPoints: 0,
    credits: 0,
    gems: 0,
    bling: 0
  };

  if (!settings) return daily;

  const sources = (incomeData as any).incomeSources;

  for (const sourceId in sources) {
    const source = sources[sourceId] as IncomeSource;
    const days = source.daysPerCycle || 1;

    let multiplier = getModification(source, settings);

    for (const resId in source.resources) {
      if (resId in daily) {
        const amount = source.resources[resId];
        (daily as any)[resId] += (amount * multiplier) / days;
      }
    }
  }

  return daily;
}


function getModification(
  incomeSource: IncomeSource,
  settings: UserSettings
): number {
  let result = 1;

  if (!incomeSource.modifiers) return result;

  for (const key in incomeSource.modifiers) {
    const modifierKey = key as keyof UserSettings;

    const sourceValue = incomeSource.modifiers[key] ?? 1;
    // Default to 0 if the setting is missing, except for specific keys that should default to 1 if we want "always on"
    // However, most deltas/counts in settings should be 0 if not provided.
    const userValue = (settings[modifierKey] as number) ?? 0;

    result = result * (sourceValue * userValue);
  }

  return result;
}