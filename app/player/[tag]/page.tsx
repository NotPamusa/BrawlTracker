import { getPlayer, parseProgressionState } from "@/utils/brawlAPI";
import { saveDailySnapshot } from "@/utils/snapshot";
import PlayerProgressionDashboard from "@/components/PlayerProgressionDashboard";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

interface PlayerPageProps {
  params: Promise<{ tag: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { tag } = await params;

  // 1. Fetch player data
  let player;
  try {
    player = await getPlayer(tag);
  } catch (err) {
    console.error("Error in getPlayer:", err);
  }

  if (!player) {
    return (
      <main className="flex flex-col flex-1 items-center justify-center pt-28 px-4 relative z-10">
        <div className="brawl-card p-12 text-center max-w-md w-full">
          <h1 className="text-xl font-display font-bold text-[var(--brawl-red)] mb-2">PLAYER NOT FOUND</h1>
          <p className="text-[var(--brawl-text-muted)] text-sm">Please check the tag and try again.</p>
        </div>
      </main>
    );
  }

  // 2. Parse progression stats & optionally save to Supabase
  const stats = parseProgressionState(player);
  try {
    await saveDailySnapshot(tag, stats);
  } catch (err) {
    console.error("Error saving snapshot:", err);
  }

  const num = (n: number) => {
    if (n >= 1000000) return parseFloat((n / 1000000).toFixed(1)).toString() + 'M';
    if (n >= 1000) return Math.floor(n / 1000).toString() + 'k';
    return n.toLocaleString();
  };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isOwnAccount = false;
  let showLinkCta = true;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('player_tag, is_verified')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.player_tag === tag.toUpperCase() && profile.is_verified) {
      isOwnAccount = true;
      showLinkCta = false;
    } else if (profile?.is_verified) {
      showLinkCta = false; // Already has another account linked
    }
  }

  return (
    <main className="flex flex-col flex-1 items-center pt-28 pb-20 px-4 sm:px-6 relative z-20 w-full max-w-6xl mx-auto space-y-6">

      {/* Header section */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white flex items-center gap-3 drop-shadow-md">
            <span style={{ color: `#${player.nameColor?.replace('0xff', '') || 'ffffff'}` }}>{player.name}</span>
            <span className="text-[var(--brawl-text-dim)] text-lg px-2 py-1 bg-black/30 rounded-md border border-white/10 uppercase tracking-wider">#{tag}</span>
            {isOwnAccount && (
              <span className="text-[var(--brawl-green)] text-xs px-2 py-1 bg-[var(--brawl-green)]/10 rounded border border-[var(--brawl-green)]/30 uppercase tracking-widest font-bold">
                VERIFIED
              </span>
            )}
          </h1>
          <p className="text-[var(--brawl-text-muted)] mt-2 font-medium flex items-center gap-2">
            🏆 {num(player.trophies)} Trophies
            {player.club?.name && <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs border border-yellow-500/30 font-bold">{player.club.name}</span>}
          </p>
        </div>

        {showLinkCta && (
          <Link 
            href={`/link-account?tag=${tag}`}
            className="chamfer-btn-primary chamfer-sm animate-fade-in-up"
          >
            <div className="btn-inner chamfer-sm !py-2 !px-4 !text-xs flex flex-col items-center gap-1">
              <span className="font-bold">IS THIS YOUR BRAWL STARS ACCOUNT?</span>
              <span className="text-[10px] opacity-70">LINK IT TO BRAWLTOMAX TO TRACK YOUR PROGRESS</span>
            </div>
          </Link>
        )}
      </div>

      <PlayerProgressionDashboard player={player} stats={stats} tag={tag} />
    </main>
  );
}
