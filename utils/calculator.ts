import { PlayerStats } from './brawlAPI';
import gameMetadata from "@/data/gameMetadata.json";
import brawlerRarities from "@/data/brawlers.json";
import incomeData from "@/data/incomeSources.json";
import { CHOICE_DELTAS, DailyActivityKey, EventsKey, EfficiencyKey } from "./constants";

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
  dailyActivityChoice: DailyActivityKey;
  eventsChoice: EventsKey;
  finishQuests: boolean;
  nMonthlySpending: number;
  currency: string;
  moneyEfficiencyChoice: EfficiencyKey;
  gemEfficiencyChoice: EfficiencyKey;
  isRankedPlayer: boolean;
  esportsRewards: boolean;
  nYearlyBrawlPass_regular: number;
  nYearlyBrawlPass_plus: number;
  nYearlyRankedPass_free: number;
  nYearlyRankedPass_regular: number;
  nYearlyBrawlPass_free: number;
  stash: Record<string, number>;
}

export interface CalculationMods {
  dailyActivityDelta: number;
  challengesDelta: number;
  eventsDelta: number;
  bscChallengeDelta: number;
  brawlPassDelta: number;
  brawlPassTailDelta: number;
  rankedPassDelta: number;
  rankedPassTailDelta: number;
  moneyEfficiency: number;
  gemEfficiency: number;
  isRankedPlayer: number;
  esportsRewards: number;
  finishQuests: number;
  nBrawlPass_regular: number;
  nBrawlPass_plus: number;
  nBrawlPass_free: number;
  nRankedPass_regular: number;
  nRankedPass_free: number;
  [key: string]: number;
}

export interface IncomeSource {
  daysPerCycle: number;
  resources: Record<string, number>;
  modifiers?: Record<string, number>;
}

export interface ResourceList {
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
  let currentCoinsProgression = settings?.stash?.coins || 0;
  let currentPPProgression = settings?.stash?.powerPoints || 0;
  let currentCreditsProgression = settings?.stash?.credits || 0;

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

export function computeSettingDeltas(player: PlayerStats, settings: UserSettings): CalculationMods {
  const {
    dailyActivityChoice = "daily",
    eventsChoice = "always",
    finishQuests = true,
    nYearlyBrawlPass_regular = 0,
    nYearlyBrawlPass_plus = 0,
    nYearlyBrawlPass_free = 12,
    nYearlyRankedPass_regular = 0,
    nYearlyRankedPass_free = 4,
    nMonthlySpending = 0,
    moneyEfficiencyChoice = "max_efficiency",
    gemEfficiencyChoice = "max_efficiency",
    isRankedPlayer = true,
    esportsRewards = false
  } = settings;

  // Handle old numeric data if it exists in dailyActivityChoice
  const dailyActivityDelta = typeof dailyActivityChoice === 'number'
    ? dailyActivityChoice
    : (CHOICE_DELTAS.dailyActivity[dailyActivityChoice] ?? 1);

  const eventDeltas = CHOICE_DELTAS.events[eventsChoice] ?? CHOICE_DELTAS.events.always;
  let challengesDelta = eventDeltas.challenges;
  let eventsDelta = eventDeltas.events;

  const maxbscWins = player.maxbscWins ?? 15;
  const bscChallengeDelta = challengesDelta * (maxbscWins / 15);

  challengesDelta *= dailyActivityDelta;
  eventsDelta *= dailyActivityDelta;

  const brawlPassDelta = finishQuests ? 1 : (dailyActivityDelta > 0.5 ? 1 : 0.8);

  let brawlPassTailDelta = finishQuests ? (1 * dailyActivityDelta) : (0.7 * dailyActivityDelta);
  brawlPassTailDelta += (nYearlyBrawlPass_regular * 0.05) + (nYearlyBrawlPass_plus * 0.1);

  const moneyEfficiencyMult = typeof moneyEfficiencyChoice === 'number'
    ? moneyEfficiencyChoice
    : (CHOICE_DELTAS.efficiency[moneyEfficiencyChoice] ?? 1);
  const moneyEfficiency = moneyEfficiencyMult * (50 / (50 + nMonthlySpending));

  const gemEfficiency = typeof gemEfficiencyChoice === 'number'
    ? gemEfficiencyChoice
    : (CHOICE_DELTAS.efficiency[gemEfficiencyChoice] ?? 1);

  let rankedPassDelta = 1;
  let rankedPassTailDelta = 1;

  // Bronze 1-3, Silver 4-6, Gold 7-9, Diamond 10-12, Mythic 13-15, Legendary 16-17, Master 18-20, Pro 21.
  const nDivisionsPerRank = 3;
  const nRanks = 7;
  const maxRank = nRanks * nDivisionsPerRank + 1;

  const peakRank = player.highestRank ?? 0;

  // ranked gives xp from wins and rankups. active players get base delta for wins, plus/minus variance depending on peak rank
  // yes -> rankedPassDelta = 0.8 +- 0.2 (scale from bronze to mythic)
  // yes -> rankedPassTailDelta = 0.7 +- 0.3 (scale from bronze to legendary)
  // no -> rankedPassTailDelta = rankedPassDelta = 0 
  if (isRankedPlayer) {
    const normalizedRank = (Math.min(peakRank, 5 * nDivisionsPerRank)) / (5 * nDivisionsPerRank);
    rankedPassDelta = 0.6 + (0.4 * normalizedRank); // 0.8 +- 0.2

    const normalizedRankTail = (Math.min(peakRank, 6 * nDivisionsPerRank)) / (6 * nDivisionsPerRank);
    rankedPassTailDelta = 0.4 + (0.6 * normalizedRankTail); // 0.7 +- 0.3
  } else {
    rankedPassDelta = 0;
    rankedPassTailDelta = 0;
  }

  return {
    dailyActivityDelta,
    challengesDelta,
    eventsDelta,
    bscChallengeDelta,
    brawlPassDelta,
    brawlPassTailDelta,
    rankedPassDelta,
    rankedPassTailDelta,
    moneyEfficiency,
    gemEfficiency,
    isRankedPlayer: isRankedPlayer ? 1 : 0,
    esportsRewards: esportsRewards ? 1 : 0,
    finishQuests: finishQuests ? 1 : 0,
    nBrawlPass_regular: nYearlyBrawlPass_regular / 12,
    nBrawlPass_plus: nYearlyBrawlPass_plus / 12,
    nBrawlPass_free: nYearlyBrawlPass_free / 12,
    nRankedPass_regular: nYearlyRankedPass_regular / 4,
    nRankedPass_free: nYearlyRankedPass_free / 4
  };
}

function calculateDailyResources(player: PlayerStats, settings?: UserSettings): ResourceList {
  const daily: ResourceList = {
    coins: 0,
    powerPoints: 0,
    credits: 0,
    gems: 0,
    bling: 0
  };
  //just need player stats for rank and trophies maybe in the future

  if (!settings) return daily;

  const sources = (incomeData as any).incomeSources;
  const computedModifiers = computeSettingDeltas(player, settings);

  //foreach incomeSource inside sources, find modifier multiplier, and then multiply that by the incomesource (each resource)
  for (const sourceId in sources) {
    const source = sources[sourceId] as IncomeSource;
    const daysPerCycle = source.daysPerCycle || 1;

    // source contains list of which modifiers we use. getModifications finds them in usersettings and returns the multiplied result.
    let multiplier = getModification(source, computedModifiers);

    for (const resourceId in source.resources) {
      if (resourceId in daily) {
        const amount = source.resources[resourceId];
        (daily as any)[resourceId] += (amount * multiplier) / daysPerCycle;
      }
    }
  }

  // Handle Monthly Spending
  if (settings.nMonthlySpending > 0) {
    let currencyMultiplier = 1;
    if (settings.currency === "EUR") currencyMultiplier = 1.05;
    if (settings.currency === "GBP") currencyMultiplier = 1.25;
    if (settings.currency === "BRL") currencyMultiplier = 0.20;

    const effectiveUsd = settings.nMonthlySpending * currencyMultiplier;
    // Base value: $1 = 1200 coins equivalent (distributed between coins, PP, credits)
    // Scaled by the efficiency (which includes diminishing returns)
    const dailySpendCoins = (effectiveUsd * 800 * computedModifiers.moneyEfficiency) / 30.416;
    const dailySpendPP = (effectiveUsd * 300 * computedModifiers.moneyEfficiency) / 30.416;
    const dailySpendCredits = (effectiveUsd * 100 * computedModifiers.moneyEfficiency) / 30.416;

    daily.coins += dailySpendCoins;
    daily.powerPoints += dailySpendPP;
    daily.credits += dailySpendCredits;
  }

  // Handle Gem Efficiency (convert gems income to progress)
  // If gemEfficiency is 1.0, they spend all gems on progress. If 0.2, they spend 20% on progress, 80% on skins.
  const gemEffMult = typeof settings.gemEfficiencyChoice === 'number'
    ? settings.gemEfficiencyChoice
    : (CHOICE_DELTAS.efficiency[settings.gemEfficiencyChoice] ?? 1);
    
  const progressGems = daily.gems * gemEffMult;
  // 1 Gem ~= 15-20 Coins equivalent depending on efficiency
  daily.coins += progressGems * 15;
  daily.powerPoints += progressGems * 5;

  // We subtract the gems that were spent on progress (if they want to see "net gems" they can, but usually gems are spent)
  daily.gems -= progressGems;

  return daily;
}


function getModification(
  incomeSource: IncomeSource,
  computedModifiers: Record<string, number>
): number {
  let result = 1;

  if (!incomeSource.modifiers) return result;

  for (const key in incomeSource.modifiers) {
    const sourceValue = incomeSource.modifiers[key] ?? 1;
    let userValue = computedModifiers[key] ?? 1;
    
    // Safety check for NaN or undefined in computed modifiers
    if (isNaN(userValue)) userValue = 1;

    result *= (sourceValue * userValue);
  }

  return result;
}