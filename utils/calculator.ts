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
  dailyActivityChoice: number;
  eventsChoice: string;
  finishQuests: boolean;
  monthlySpending: number;
  currency: string;
  moneyEfficiencyChoice: number;
  gemEfficiencyChoice: number;
  isRankedPlayer: boolean;
  esportsRewards: boolean;
  nBrawlPass_regular: number;
  nBrawlPass_plus: number;
  nRankedPass_free: number;
  nRankedPass_regular: number;
  nBrawlPass_free: number;
  stash: Record<string, number>;
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

export function computeSettingDeltas(player: PlayerStats, settings: UserSettings): Record<string, number> {
  const { 
    dailyActivityChoice, eventsChoice, finishQuests, 
    nBrawlPass_regular, nBrawlPass_plus, nBrawlPass_free,
    nRankedPass_regular, nRankedPass_free,
    monthlySpending, moneyEfficiencyChoice, gemEfficiencyChoice,
    isRankedPlayer, esportsRewards
  } = settings;

  const dailyActivityDelta = dailyActivityChoice;
  
  let challengesDelta = 1;
  let eventsDelta = 1;
  if (eventsChoice === 'always') { challengesDelta = 1; eventsDelta = 1; }
  else if (eventsChoice === 'challenges') { challengesDelta = 1; eventsDelta = 0.7; }
  else if (eventsChoice === 'events') { challengesDelta = 0.7; eventsDelta = 1; }
  else if (eventsChoice === 'sometimes') { challengesDelta = 0.6; eventsDelta = 0.6; }
  else if (eventsChoice === 'rarely') { challengesDelta = 0.4; eventsDelta = 0.4; }

  const maxbscWins = player.maxbscWins ?? 15;
  const bscChallengeDelta = challengesDelta * (maxbscWins / 15);

  challengesDelta *= dailyActivityDelta;
  eventsDelta *= dailyActivityDelta;

  const brawlPassDelta = finishQuests ? 1 : (dailyActivityDelta > 0.5 ? 1 : 0.8);
  
  let brawlPassTailDelta = finishQuests ? (1 * dailyActivityDelta) : (0.7 * dailyActivityDelta);
  brawlPassTailDelta += (nBrawlPass_regular * 12 * 0.05) + (nBrawlPass_plus * 12 * 0.1);

  const moneyEfficiency = moneyEfficiencyChoice * (50 / (50 + monthlySpending));
  const gemEfficiency = gemEfficiencyChoice;

  let rankedPassDelta = 1;
  let rankedPassTailDelta = 1;
  
  // Convert API rank (1-19) to our 1-7 scale if it exists, otherwise default to Diamond (4)
  const apiRank = player.highestRank ?? 10; // Default to Diamond 1
  const peakRank = apiRank === 19 ? 7 : Math.min(7, Math.floor((apiRank - 1) / 3) + 1);

  if (isRankedPlayer) {
    const normalizedRank = (Math.min(peakRank, 5) - 1) / 4;
    rankedPassDelta = 0.6 + (0.4 * normalizedRank);
    
    const normalizedRankTail = (Math.min(peakRank, 6) - 1) / 5;
    rankedPassTailDelta = 0.4 + (0.6 * normalizedRankTail);
  } else {
    const normalizedRank = (peakRank - 1) / 6;
    rankedPassDelta = 0.0 + (1.0 * normalizedRank);
    
    rankedPassTailDelta = Math.max(0, -0.2 + (1.2 * normalizedRank));
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
    nBrawlPass_regular,
    nBrawlPass_plus,
    nBrawlPass_free,
    nRankedPass_regular,
    nRankedPass_free
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
  if (settings.monthlySpending > 0) {
    let currencyMultiplier = 1;
    if (settings.currency === "EUR") currencyMultiplier = 1.05;
    if (settings.currency === "GBP") currencyMultiplier = 1.25;
    if (settings.currency === "BRL") currencyMultiplier = 0.20;

    const effectiveUsd = settings.monthlySpending * currencyMultiplier;
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
  const progressGems = daily.gems * settings.gemEfficiencyChoice;
  // 1 Gem ~= 20 Coins equivalent
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
    const userValue = computedModifiers[key] ?? 1;
    // should never have empty numbers file modifier, and neither userSettings deltas, so if it is, probably a mistake and we can multiply by 1 so nothing changes

    result *= (sourceValue * userValue);
  }

  return result;
}