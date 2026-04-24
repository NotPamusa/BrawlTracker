import { UserSettings } from "./calculator";

export const DEFAULT_SETTINGS: UserSettings = {
  dailyActivityChoice: 1,
  eventsChoice: "always",
  finishQuests: true,
  monthlySpending: 0,
  currency: "USD",
  moneyEfficiencyChoice: 1,
  gemEfficiencyChoice: 1,
  isRankedPlayer: false,
  esportsRewards: false,
  nBrawlPass_regular: 0,
  nBrawlPass_plus: 0,
  nRankedPass_free: 1, // 100% of the time (4/4)
  nRankedPass_regular: 0,
  nBrawlPass_free: 1, // 100% of the time (12/12)
  stash: {}
};
