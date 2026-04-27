import { PlayerStats } from './brawlAPI';
import gameMetadata from "@/data/gameMetadata.json";
import brawlerRarities from "@/data/brawlers.json";
import incomeData from "@/data/incomeSources.json";
import valueConversionsData from "@/data/valueConversions.json";
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
  // Item acquisition rates (expected items gained per day from random drops)
  gadget: number;
  starPower: number;
  hypercharge: number;
  buffie: number;
}

export function calculateDaysToMax(
  player: PlayerStats,
  mode: 'MAX' | 'FullMAX' = 'MAX',
  settings?: UserSettings
): CalculationResult {
  // ─── Stash: unspent resources the player currently holds ───
  const stashCoins = settings?.stash?.coins || 0;
  const stashPP = settings?.stash?.powerPoints || 0;
  const stashCredits = settings?.stash?.credits || 0;

  // ─── Coin/PP already "spent" (invested into brawler progression) ───
  let spentCoins = 0;
  let spentPP = 0;

  // ─── Credits (brawler unlock cost) ───
  let totalCreditCostAllBrawlers = 0;
  let creditProgressionSpent = 0;

  // Normalize names to ignore spaces, dashes, and other punctuation (e.g. "8-BIT" vs "8BIT", "MR. P" vs "MRP")
  const normalizeName = (name: string) => name.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const ownedBrawlerNames = new Set(player.brawlers.map(b => normalizeName(b.name)));

  Object.entries(brawlerRarities).forEach(([name, rarity]) => {
    const cost = RARITY_COSTS[rarity] || 0;
    totalCreditCostAllBrawlers += cost;
    if (ownedBrawlerNames.has(normalizeName(name))) {
      creditProgressionSpent += cost;
    }
  });

  // Save the initial total cost to return at the end (before simulation inflates it)
  const initialTotalCreditCost = totalCreditCostAllBrawlers;
  let currentTotalCreditCost = totalCreditCostAllBrawlers;

  // ─── Target item counts per brawler (depends on mode) ───
  // MAX  = competitive minimum (1 gadget, 1 SP)
  // FullMAX = every single item (2 gadgets, 2 SPs)
  const targetGadgets = mode === 'FullMAX' ? 2 : 1;
  const targetSPs = mode === 'FullMAX' ? 2 : 1;
  const targetGears = 2;
  const targetHC = 1;
  const targetBuffies = 3;

  // ─── Count owned items across all brawlers ───
  let totalOwnedGadgets = 0;   // gadgets owned (capped at target per brawler)
  let totalOwnedSPs = 0;
  let totalOwnedGears = 0;
  let totalOwnedHCs = 0;
  let totalOwnedBuffies = 0;

  // Raw totals (not capped) — needed for drop probability denominators
  let totalRawGadgets = 0;
  let totalRawSPs = 0;

  for (const brawler of player.brawlers) {
    // Coins/PP invested into leveling
    const lvlIdx = brawler.power - 1;
    spentPP += PP_TO_LEVEL[lvlIdx] ?? 0;
    spentCoins += COINS_TO_LEVEL[lvlIdx] ?? 0;

    // Count items owned (capped to what we care about for this mode)
    const rawGadgets = brawler.gadgets?.length ?? 0;
    const rawSPs = brawler.starPowers?.length ?? 0;
    totalRawGadgets += rawGadgets;
    totalRawSPs += rawSPs;

    const gadgetsOwned = Math.min(rawGadgets, targetGadgets);
    totalOwnedGadgets += gadgetsOwned;

    const spOwned = Math.min(rawSPs, targetSPs);
    totalOwnedSPs += spOwned;

    const gearsOwned = Math.min(brawler.gears?.length ?? 0, targetGears);
    totalOwnedGears += gearsOwned;

    const hcOwned = Math.min(brawler.hyperCharges?.length ?? 0, targetHC);
    totalOwnedHCs += hcOwned;

    let buffiesOwnedCount = 0;
    if (brawler.buffies) {
      if (brawler.buffies.gadget) buffiesOwnedCount++;
      if (brawler.buffies.starPower) buffiesOwnedCount++;
      if (brawler.buffies.hyperCharge) buffiesOwnedCount++;
    }
    const buffiesOwned = Math.min(buffiesOwnedCount, targetBuffies);
    totalOwnedBuffies += buffiesOwned;

    // Add coin cost of owned items to spent progression
    spentCoins += gadgetsOwned * COST_GADGET;
    spentCoins += spOwned * COST_STAR_POWER;
    spentCoins += gearsOwned * COST_GEAR;
    spentCoins += hcOwned * COST_HYPERCHARGE;
    spentCoins += buffiesOwned * COST_BUFFIE_COINS;

    spentPP += buffiesOwned * COST_BUFFIE_PP;
  }

  // ─── Max targets (total cost to fully max the game) ───
  const totalBrawlers = gameMetadata.totalBrawlers;
  // Buffie target depends on mode: FullMAX targets all brawlers, MAX only released buffie brawlers
  const totalTargetBuffies = mode === 'FullMAX'
    ? totalBrawlers * targetBuffies
    : gameMetadata.releasedBuffieBrawlerCount * targetBuffies;

  const nMaxCoins = (COINS_MAX + COST_GADGET * targetGadgets + COST_STAR_POWER * targetSPs
    + COST_GEAR * targetGears + COST_HYPERCHARGE * targetHC) * totalBrawlers
    + COST_BUFFIE_COINS * totalTargetBuffies;
  const nMaxPP = PP_MAX * totalBrawlers + COST_BUFFIE_PP * totalTargetBuffies;

  // Total current progression = spent + stash
  const currentCoinsProgression = spentCoins + stashCoins;
  const currentPPProgression = spentPP + stashPP;
  const currentCreditsProgression = creditProgressionSpent + stashCredits;

  // ─── Daily income rates ───
  const m_dailyResources = calculateDailyResources(player, settings);
  const dailyCoins = m_dailyResources.coins || 0;
  const dailyPP = m_dailyResources.powerPoints || 0;
  const dailyCredits = m_dailyResources.credits || 0;

  // Daily item acquisition rates from random drops
  const dailyGadgetRate = m_dailyResources.gadget || 0;
  const dailySPRate = m_dailyResources.starPower || 0;
  const dailyHCRate = m_dailyResources.hypercharge || 0;
  const dailyBuffieRate = m_dailyResources.buffie || 0;

  // ─── Fallback reward values (from valueConversions) ───
  // When a drop would give an item but all slots are full, these lesser rewards are given instead
  const fallbackGadgetCoins = (valueConversionsData as any).fallback_gadget?.coins ?? 0;
  const fallbackSPCoins = (valueConversionsData as any).fallback_starpower?.coins ?? 0;
  const fallbackHCCoins = (valueConversionsData as any).fallback_hypercharge?.coins ?? 0;
  const fallbackBuffieCoins = (valueConversionsData as any).fallback_buffie?.coins ?? 0;
  const fallbackBuffiePP = (valueConversionsData as any).fallback_buffie?.powerPoints ?? 0;

  // ─── Brawler inflation: new brawlers add items to the target every day ───
  const BRAWLER_RELEASE_RATE = gameMetadata.brawlerReleaseRate; // ~1/30 brawlers per day

  // ─── SIMULATION: empty item slots + unowned item pools ───
  // "Empty slots" = slots we still NEED to fill (target - owned). These are the "winning" outcomes.
  // "Unowned items" = total items in game pool the player doesn't have. This is the denominator
  //    for probability. Gadgets/SPs have 2 per brawler in the game regardless of target.
  let emptyGadgetSlots = (totalBrawlers * targetGadgets) - totalOwnedGadgets;
  let emptySPSlots = (totalBrawlers * targetSPs) - totalOwnedSPs;
  let emptyHCSlots = (totalBrawlers * targetHC) - totalOwnedHCs;
  let emptyBuffieSlots = totalTargetBuffies - totalOwnedBuffies;

  // Total unowned gadgets/SPs in the game (always 2 per brawler, not affected by mode target)
  let unownedGadgets = (totalBrawlers * 2) - totalRawGadgets;
  let unownedSPs = (totalBrawlers * 2) - totalRawSPs;

  // ─── Fixed costs: levels, gears — items that are bought directly, not from random drops ───
  // These are purely coin/PP costs that don't interact with the probability system
  const totalLevelCoinCost = COINS_MAX * totalBrawlers;
  const totalLevelPPCost = PP_MAX * totalBrawlers;
  const totalGearCoinCost = COST_GEAR * targetGears * totalBrawlers;
  const fixedCoinCostRemaining = Math.max(0,
    (totalLevelCoinCost + totalGearCoinCost) - (spentCoins
      - totalOwnedGadgets * COST_GADGET
      - totalOwnedSPs * COST_STAR_POWER
      - totalOwnedHCs * COST_HYPERCHARGE
      - totalOwnedBuffies * COST_BUFFIE_COINS)
  );
  const fixedPPCostRemaining = Math.max(0,
    totalLevelPPCost - (spentPP - totalOwnedBuffies * COST_BUFFIE_PP)
  );

  // ─── DAILY SIMULATION LOOP ───
  // Each iteration = 1 day. We accumulate wealth and decay empty item slots
  // until hoarded resources >= dynamic buyout cost of everything remaining.
  let daysPassed = 0;
  const MAX_SIMULATION_DAYS = 10000; // safety cap

  // Hoarded = spendable stash the player accumulates over time
  let hoardedCoins = stashCoins;
  let hoardedPP = stashPP;
  let hoardedCredits = stashCredits;

  // Track coin/PP days separately for the breakdown display
  let daysCoins = 0;
  let daysPP = 0;
  let daysCredits = 0;
  let coinsSatisfied = false;
  let ppSatisfied = false;
  let creditsSatisfied = false;

  while (daysPassed < MAX_SIMULATION_DAYS) {
    // ── Step 1: Calculate dynamic buyout cost for THIS day ──
    // This is what it would cost to buy every remaining item right now
    const dynamicCoinCost = fixedCoinCostRemaining
      + (emptyGadgetSlots * COST_GADGET)
      + (emptySPSlots * COST_STAR_POWER)
      + (emptyHCSlots * COST_HYPERCHARGE)
      + (emptyBuffieSlots * COST_BUFFIE_COINS);

    const dynamicPPCost = fixedPPCostRemaining
      + (emptyBuffieSlots * COST_BUFFIE_PP);

    const dynamicCreditCost = Math.max(0, currentTotalCreditCost - creditProgressionSpent);

    // ── Step 2: Check if we can afford everything ──
    if (!coinsSatisfied && hoardedCoins >= dynamicCoinCost) {
      coinsSatisfied = true;
      daysCoins = daysPassed;
    }
    if (!ppSatisfied && hoardedPP >= dynamicPPCost) {
      ppSatisfied = true;
      daysPP = daysPassed;
    }
    if (!creditsSatisfied && hoardedCredits >= dynamicCreditCost) {
      creditsSatisfied = true;
      daysCredits = daysPassed;
    }

    // All three resources satisfied → done
    if (coinsSatisfied && ppSatisfied && creditsSatisfied) break;

    daysPassed++;

    // ── Step 3: Accumulate daily income ──
    hoardedCoins += dailyCoins;
    hoardedPP += dailyPP;
    hoardedCredits += dailyCredits;

    // ── Step 4: Expand the game (new brawler releases add items to targets) ──
    // New brawlers add empty slots and expand the unowned pool
    emptyGadgetSlots += BRAWLER_RELEASE_RATE * targetGadgets;
    emptySPSlots += BRAWLER_RELEASE_RATE * targetSPs;
    emptyHCSlots += BRAWLER_RELEASE_RATE * targetHC;
    // Buffie inflation: only in FullMAX (MAX uses static releasedBuffieBrawlerCount)
    if (mode === 'FullMAX') {
      emptyBuffieSlots += BRAWLER_RELEASE_RATE * targetBuffies;
    }

    // Unowned pool always uses 2 gadgets/SPs per brawler (game total, not target)
    unownedGadgets += BRAWLER_RELEASE_RATE * 2;
    unownedSPs += BRAWLER_RELEASE_RATE * 2;

    // New brawler inflation also increases the credit and fixed coin/PP targets
    currentTotalCreditCost += BRAWLER_RELEASE_RATE * (COST_EPIC); // avg new brawler cost

    // ── Step 5: Process random drops (probability of hitting a useful slot) ──
    // For gadgets/SPs: each brawler has 2 total items in the pool.
    // Probability a drop fills a USEFUL slot = (empty target slots) / (total unowned in pool)
    // The probability is clamped to [0, 1] for safety.
    const probUsefulGadget = unownedGadgets > 0
      ? Math.min(1, Math.max(0, emptyGadgetSlots / unownedGadgets))
      : 0;
    const probUsefulSP = unownedSPs > 0
      ? Math.min(1, Math.max(0, emptySPSlots / unownedSPs))
      : 0;

    // For HCs and buffies: no duplicates exist, so every drop fills a slot directly
    // (probability is effectively 1 as long as slots remain)

    // ── Step 6: Decay empty slots based on daily drop rates × probability ──
    // Useful drops: fill a target slot (save us from buying it)
    const usefulGadgetDrops = dailyGadgetRate * probUsefulGadget;
    const usefulSPDrops = dailySPRate * probUsefulSP;

    // Useless drops: hit a non-target slot, give fallback reward instead
    const uselessGadgetDrops = dailyGadgetRate * (1 - probUsefulGadget);
    const uselessSPDrops = dailySPRate * (1 - probUsefulSP);

    // HC and buffie: 1 drop = 1 slot filled (no duplicates), fallback when slots empty
    const usefulHCDrops = emptyHCSlots > 0 ? Math.min(dailyHCRate, emptyHCSlots) : 0;
    const uselessHCDrops = dailyHCRate - usefulHCDrops;
    const usefulBuffieDrops = emptyBuffieSlots > 0 ? Math.min(dailyBuffieRate, emptyBuffieSlots) : 0;
    const uselessBuffieDrops = dailyBuffieRate - usefulBuffieDrops;

    // Reduce empty slots by useful drops
    emptyGadgetSlots = Math.max(0, emptyGadgetSlots - usefulGadgetDrops);
    emptySPSlots = Math.max(0, emptySPSlots - usefulSPDrops);
    emptyHCSlots = Math.max(0, emptyHCSlots - usefulHCDrops);
    emptyBuffieSlots = Math.max(0, emptyBuffieSlots - usefulBuffieDrops);

    // Also reduce unowned pool (any drop removes from the global pool)
    unownedGadgets = Math.max(0, unownedGadgets - dailyGadgetRate);
    unownedSPs = Math.max(0, unownedSPs - dailySPRate);

    // ── Step 7: Add fallback reward coins/PP from useless drops ──
    hoardedCoins += uselessGadgetDrops * fallbackGadgetCoins;
    hoardedCoins += uselessSPDrops * fallbackSPCoins;
    hoardedCoins += uselessHCDrops * fallbackHCCoins;
    hoardedCoins += uselessBuffieDrops * fallbackBuffieCoins;
    hoardedPP += uselessBuffieDrops * fallbackBuffiePP;
  }

  // If loop exhausted without satisfying, use daysPassed
  if (!coinsSatisfied) daysCoins = daysPassed;
  if (!ppSatisfied) daysPP = daysPassed;
  if (!creditsSatisfied) daysCredits = daysPassed;

  const maxDays = Math.ceil(Math.max(daysCoins, daysPP, daysCredits));

  return {
    daysCoins: Math.ceil(daysCoins),
    daysPowerPoints: Math.ceil(daysPP),
    daysCredits: Math.ceil(daysCredits),
    maxDays,
    nMaxCoins,
    currentCoins: currentCoinsProgression,
    nMaxPP,
    currentPP: currentPPProgression,
    nMaxCredits: initialTotalCreditCost,
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
    bling: 0,
    gadget: 0,
    starPower: 0,
    hypercharge: 0,
    buffie: 0
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
      const amount = source.resources[resourceId];
      const conversions = (valueConversionsData as any)[resourceId];

      if (conversions) {
        for (const targetResource in conversions) {
          if (targetResource in daily) {
            (daily as any)[targetResource] += (amount * conversions[targetResource] * multiplier) / daysPerCycle;
          }
        }
      } else if (resourceId in daily) {
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