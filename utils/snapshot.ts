import { createClient } from '@/utils/supabase/server';

export interface ProgressionStats {
  brawlers_unlocked: number;
  brawlers_with_gadget: number;
  total_gadgets: number;
  brawlers_with_star_power: number;
  total_star_powers: number;
  brawlers_with_gear: number;
  total_gears: number;
  brawlers_with_hypercharge: number;
  total_hypercharges: number;
  brawlers_with_buffie: number;
  total_buffies: number;
  stash_coins: number;
  stash_power_points: number;
}

export async function saveDailySnapshot(tag: string, stats: ProgressionStats) {
  const supabase = await createClient();

  // Create a snapshot for TODAY
  // The unique constraint will prevent inserting a second one today.
  const { data, error } = await supabase
    .from('player_snapshots')
    .insert([{
      tag: tag.replace('#', ''),
      ...stats
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Unique violation: Snapshot already exists for today.
      // We ignore this error and just return successfully.
      return;
    }
    console.error("Error saving daily snapshot:", error);
  }
}
