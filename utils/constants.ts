import { UserSettings } from "./calculator";

export const CHOICE_DELTAS = {
  dailyActivity: {
    "hardcore": 1,      // 1+ hours every day
    "daily": 0.95,      // 6+ wins almost every day
    "active": 0.8,      // 5-6 days a week
    "regular": 0.6,     // 4 days a week
    "casual": 0.5       // Only weekends and days off
  },
  events: {
    "always": { challenges: 1, events: 1 },
    "challenges": { challenges: 1, events: 0.7 },
    "events": { challenges: 0.7, events: 1 },
    "sometimes": { challenges: 0.6, events: 0.6 },
    "rarely": { challenges: 0.4, events: 0.4 }
  },
  efficiency: { //used for gem spending and money spending
    "max_efficiency": 1,
    "high_efficiency": 0.8,
    "mixed": 0.6,
    "skins": 0.2
  }
} as const;

export type DailyActivityKey = keyof typeof CHOICE_DELTAS.dailyActivity;
export type EventsKey = keyof typeof CHOICE_DELTAS.events;
export type EfficiencyKey = keyof typeof CHOICE_DELTAS.efficiency;

export const DEFAULT_SETTINGS: UserSettings = {
  dailyActivityChoice: "daily",
  eventsChoice: "always",
  finishQuests: true,
  nMonthlySpending: 0,
  currency: "USD",
  moneyEfficiencyChoice: "max_efficiency",
  gemEfficiencyChoice: "max_efficiency",
  isRankedPlayer: true,
  esportsRewards: false,
  nYearlyBrawlPass_free: 12,
  nYearlyBrawlPass_regular: 0,
  nYearlyBrawlPass_plus: 0,
  nYearlyRankedPass_free: 4,
  nYearlyRankedPass_regular: 0,
  stash: {}
};

export const ACTIVE_LOW_SPENDER_SETTINGS: UserSettings = {
  dailyActivityChoice: "daily",
  eventsChoice: "always",
  finishQuests: true,
  nMonthlySpending: 10,
  currency: "USD",
  moneyEfficiencyChoice: "max_efficiency",
  gemEfficiencyChoice: "max_efficiency",
  isRankedPlayer: true,
  esportsRewards: false,
  nYearlyBrawlPass_free: 8,
  nYearlyBrawlPass_regular: 4,
  nYearlyBrawlPass_plus: 0,
  nYearlyRankedPass_free: 3,
  nYearlyRankedPass_regular: 1,
  stash: {}
};

export const ACTIVE_HIGH_SPENDER_SETTINGS: UserSettings = {
  dailyActivityChoice: "hardcore",
  eventsChoice: "always",
  finishQuests: true,
  nMonthlySpending: 30,
  currency: "USD",
  moneyEfficiencyChoice: "mixed",
  gemEfficiencyChoice: "mixed",
  isRankedPlayer: true,
  esportsRewards: false,
  nYearlyBrawlPass_free: 2,
  nYearlyBrawlPass_regular: 10,
  nYearlyBrawlPass_plus: 0,
  nYearlyRankedPass_free: 2,
  nYearlyRankedPass_regular: 2,
  stash: {}
};

export const WHALE_SETTINGS: UserSettings = {
  dailyActivityChoice: "daily",
  eventsChoice: "always",
  finishQuests: true,
  nMonthlySpending: 100,
  currency: "USD",
  moneyEfficiencyChoice: "mixed",
  gemEfficiencyChoice: "mixed",
  isRankedPlayer: true,
  esportsRewards: false,
  nYearlyBrawlPass_free: 0,
  nYearlyBrawlPass_regular: 0,
  nYearlyBrawlPass_plus: 12,
  nYearlyRankedPass_free: 0,
  nYearlyRankedPass_regular: 4,
  stash: {}
};