export interface BrawlerItem {
  id: number;
  name: string;
}

export interface BrawlerStat {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  gadgets: BrawlerItem[];
  starPowers: BrawlerItem[];
  gears: BrawlerItem[];
  hyperCharges?: BrawlerItem[];
  buffies?: {
    gadget: boolean;
    starPower: boolean;
    hyperCharge: boolean;
  };
}

export interface PlayerStats {
  tag: string;
  name: string;
  nameColor: string;
  icon: { id: number };
  trophies: number;
  highestTrophies: number;
  expLevel: number;
  expPoints: number;
  isQualifiedFromChampionshipChallenge: boolean;
  "3vs3Victories": number;
  soloVictories: number;
  duoVictories: number;
  bestRoboRumbleTime: number;
  bestTimeAsBigBrawler: number;
  club: {
    tag: string;
    name: string;
  };
  highestRank?: number;
  maxbscWins?: number;
  brawlers: BrawlerStat[];
}

import gameMetadata from "@/data/gameMetadata.json";

/**
 * Global count of brawlers that currently have Buffies released.
 * Pulled from gameMetadata.json
 */
export const RELEASED_BUFFIES_BRAWLER_COUNT = gameMetadata.releasedBuffieBrawlerCount;

export async function getPlayer(tag: string): Promise<PlayerStats | null> {
  const cleanTag = encodeURIComponent(tag.replace('#', '').toUpperCase());
  const apiKey = process.env.BRAWL_API_KEY;

  if (!apiKey) {
    console.warn("BRAWL_API_KEY is not set.");
    return null;
  }

  try {
    const res = await fetch(`https://bsproxy.royaleapi.dev/v1/players/%23${cleanTag}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`RoyaleAPI returned status: ${res.status}. Body: ${errorBody}`);
      return null;
    }

    const data = await res.json();
    return data as PlayerStats;
  } catch (error) {
    console.error("Failed to fetch player from API:", error);
    return null;
  }
}

export function parseProgressionState(player: PlayerStats) {
  const brawlersCount = player.brawlers.length;

  let gadgetsCount = 0;
  let brawlersWithGadget = 0;

  let spCount = 0;
  let brawlersWithSp = 0;

  let gearsCount = 0;
  let brawlersWithGear = 0;

  let hcCount = 0;
  let brawlersWithHc = 0;

  let buffiesCount = 0;
  let brawlersWithBuffie = 0;
  for (const brawler of player.brawlers) {
    const bGadgets = brawler.gadgets?.length || 0;
    if (bGadgets > 0) {
      gadgetsCount += bGadgets;
      brawlersWithGadget++;
    }

    const bSp = brawler.starPowers?.length || 0;
    if (bSp > 0) {
      spCount += bSp;
      brawlersWithSp++;
    }

    const bGears = brawler.gears?.length || 0;
    if (bGears > 0) {
      gearsCount += Math.min(bGears, 2);
      brawlersWithGear++;
    }

    const bHc = brawler.hyperCharges?.length || 0;
    if (bHc > 0) {
      hcCount += bHc;
      brawlersWithHc++;
    }

    if (brawler.buffies) {
      const bBuffyCount = (brawler.buffies.gadget ? 1 : 0) +
        (brawler.buffies.starPower ? 1 : 0) +
        (brawler.buffies.hyperCharge ? 1 : 0);
      if (bBuffyCount > 0) {
        buffiesCount += bBuffyCount;
        brawlersWithBuffie++;
      }
    }
  }

  const result = {
    brawlers_unlocked: brawlersCount,
    brawlers_with_gadget: brawlersWithGadget,
    total_gadgets: gadgetsCount,
    brawlers_with_star_power: brawlersWithSp,
    total_star_powers: spCount,
    brawlers_with_gear: brawlersWithGear,
    total_gears: gearsCount,
    brawlers_with_hypercharge: brawlersWithHc,
    total_hypercharges: hcCount,
    brawlers_with_buffie: brawlersWithBuffie,
    total_buffies: buffiesCount,
    stash_coins: 0,
    stash_power_points: 0
  };

  return result;
}
