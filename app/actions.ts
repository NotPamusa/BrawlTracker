"use server";

import { createClient } from "@/utils/supabase/server";
import { getPlayer } from "@/utils/brawlAPI";
import { redirect } from "next/navigation";

//const ICON_LIST = Array.from({ length: 29 }, (_, i) => 28000000 + i); // 28000000 to 28000028 (29 icons)
const ICON_LIST = [28000000, 28000001, 28000002, 28000003, 28000020, 28000021, 28000022, 28000023, 28000024, 28000025, 28000026, 28000027, 28000030, 28000031, 28000032, 28000033];

export async function startVerification(tag: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Must be logged in to link account");
  }

  const cleanTag = tag.replace('#', '').toUpperCase();
  const player = await getPlayer(cleanTag);

  if (!player) {
    throw new Error("Player not found");
  }

  // 1. Check if tag is already linked to someone else
  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id, is_verified')
    .eq('player_tag', cleanTag)
    .maybeSingle();

  if (existing && existing.id !== user.id) {
    if (existing.is_verified) {
      throw new Error("This account is already linked to another user.");
    } else {
      // If someone else is verifying it, we block it for now to avoid DB conflicts.
      // They could potentially "steal" it if we cleared the other user's tag, 
      // but let's keep it safe for now.
      throw new Error("This account is currently being verified by another user.");
    }
  }

  // 2. Verification threshold check
  if (player.trophies < 13000) {
    // Auto-verify
    await supabase.from('profiles').upsert({
      id: user.id,
      player_tag: cleanTag,
      is_verified: true,
      verification_icon: null,
      verification_expires_at: null
    });
    return { status: 'verified', message: 'Account auto-verified (low trophies)' };
  }

  // 3. Generate random icon for verification
  let randomIcon;
  const currentIcon = player.icon.id;

  do {
    const randomIndex = Math.floor(Math.random() * ICON_LIST.length);
    randomIcon = ICON_LIST[randomIndex];
  } while (randomIcon === currentIcon);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

  const { error: upsertError } = await supabase.from('profiles').upsert({
    id: user.id,
    player_tag: cleanTag,
    is_verified: false,
    verification_icon: randomIcon,
    verification_expires_at: expiresAt
  });

  if (upsertError) {
    console.error("Upsert error in startVerification:", upsertError);
    throw new Error("Failed to save verification state: " + upsertError.message);
  }

  return { status: 'pending', iconId: randomIcon, expiresAt };
}

export async function checkVerification() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch error in checkVerification:", profileError);
    throw new Error("Failed to fetch profile: " + profileError.message);
  }

  if (!profile || !profile.player_tag || !profile.verification_icon) {
    console.warn("Verification check failed - Profile state:", {
      exists: !!profile,
      hasTag: !!profile?.player_tag,
      hasIcon: !!profile?.verification_icon,
      isVerified: profile?.is_verified
    });
    throw new Error("No verification in progress");
  }

  // Check expiry
  if (new Date() > new Date(profile.verification_expires_at)) {
    throw new Error("Verification expired. Please try again.");
  }

  const player = await getPlayer(profile.player_tag);
  if (!player) throw new Error("Could not fetch player data");

  if (player.icon.id === profile.verification_icon) {
    await supabase.from('profiles').update({
      is_verified: true,
      verification_icon: null,
      verification_expires_at: null
    }).eq('id', user.id);

    return { status: 'success' };
  } else {
    return { status: 'failed', message: "The API might take a while to update your information, please try again in a minute" };
  }
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return data;
}

export async function fetchPlayer(tag: string) {
  return await getPlayer(tag);
}

export async function toggleTracked(tag: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to track accounts");

  const cleanTag = tag.replace('#', '').toUpperCase();

  // Check if already tracked
  const { data: existing } = await supabase
    .from('tracked_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('player_tag', cleanTag)
    .maybeSingle();

  if (existing) {
    // Untrack
    await supabase.from('tracked_accounts').delete().eq('id', existing.id);
    return { status: 'untracked' };
  } else {
    // Check limit
    const { count } = await supabase
      .from('tracked_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count && count >= 5) {
      throw new Error("You can only track up to 5 accounts.");
    }

    // Track
    await supabase.from('tracked_accounts').insert({ user_id: user.id, player_tag: cleanTag });
    return { status: 'tracked' };
  }
}

export async function isTracked(tag: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('tracked_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('player_tag', tag.replace('#', '').toUpperCase())
    .maybeSingle();

  return !!data;
}

export async function getTrackedAccounts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('tracked_accounts')
    .select('player_tag')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data?.map(d => d.player_tag) || [];
}
