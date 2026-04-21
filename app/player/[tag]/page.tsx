import EstimateCard from "@/components/EstimateCard";
import { getPlayer, parseProgressionState, RELEASED_BUFFIES_BRAWLER_COUNT } from "@/utils/brawlAPI";
import { saveDailySnapshot } from "@/utils/snapshot";
import { calculateDaysToMax } from "@/utils/calculator";

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
    // Continue anyway so user sees the data
  }

  // 3. Calculate time to max
  const estimate = calculateDaysToMax(player, 'MAX');

  /**
   * Helper to format numbers compactly (e.g. 25800 -> 25.8k, 12000 -> 12k)
   */
  const num = (n: number) => {
    if (n >= 1000000) return parseFloat((n / 1000000).toFixed(1)).toString() + 'M';
    if (n >= 1000) return Math.floor(n / 1000).toString() + 'k';
    return n.toLocaleString();
  };

  const StatBox = ({ title, current, max, colorHex, valueLabel, iconUrl }: { title: string, current: number, max: number, colorHex: string, valueLabel?: string, iconUrl?: string }) => {
    const pct = Math.max(0, Math.min(100, max > 0 ? (current / max) * 100 : 100));
    return (
      <div
        className="chamfer-sm p-[2px] h-fit md:h-full flex flex-col transition-all duration-300 hover:translate-y-[-2px]"
        style={{
          background: `linear-gradient(135deg, ${colorHex}40 0%, ${colorHex}10 100%)`,
          boxShadow: `0 4px 15px ${colorHex}15`
        }}
      >
        <div className="chamfer-sm bg-[var(--brawl-bg-card)] h-full p-4 flex flex-col relative overflow-hidden min-h-[130px]">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-20" style={{ backgroundColor: colorHex }} />

          <div className="relative z-10 flex flex-col gap-1 w-full h-full">
            <div className="flex justify-between items-start w-full gap-2">
              <h3 className="text-[9px] sm:text-[10px] text-[var(--brawl-text-dim)] font-bold uppercase tracking-wider leading-tight flex-1 min-w-0 break-words overflow-hidden">
                {title}
              </h3>
              {iconUrl && (
                <div className="w-8 h-8 flex-shrink-0">
                  <img src={iconUrl} className="w-full h-full object-contain drop-shadow-md" alt="" />
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-display font-bold leading-none" style={{ color: colorHex }}>
                {num(current)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-white/40 tracking-wider">
                / {num(max)} {valueLabel}
              </span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-center flex-grow pt-2">
            <div className={`w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative ${pct === 100 ? 'ring-1 ring-yellow-400/50' : ''}`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${pct === 100 ? 'animate-pulse' : ''}`}
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct === 100 ? '#fbbf24' : colorHex,
                  boxShadow: pct === 100 ? '0 0 15px #fbbf24' : `0 0 8px ${colorHex}`
                }}
              >
                {pct === 100 && (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[sweep_2s_infinite]" />
                )}
              </div>
            </div>
            {pct === 100 && (
              <div className="absolute -bottom-1 right-0 text-[8px] font-black italic tracking-tighter text-yellow-500 uppercase leading-none drop-shadow-[0_0.5px_1px_rgba(0,0,0,1)] [text-shadow:0_0_2px_black] [-webkit-text-stroke:0.1px_black]">MAXED</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col flex-1 items-center pt-28 pb-20 px-4 sm:px-6 relative z-10 w-full max-w-6xl mx-auto space-y-6">

      {/* Header section */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white flex items-center gap-3 drop-shadow-md">
            <span style={{ color: `#${player.nameColor?.replace('0xff', '') || 'ffffff'}` }}>{player.name}</span>
            <span className="text-[var(--brawl-text-dim)] text-lg px-2 py-1 bg-black/30 rounded-md border border-white/10 uppercase tracking-wider">#{tag}</span>
          </h1>
          <p className="text-[var(--brawl-text-muted)] mt-2 font-medium flex items-center gap-2">
            🏆 {num(player.trophies)} Trophies
            {player.club?.name && <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs border border-yellow-500/30 font-bold">{player.club.name}</span>}
          </p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Main Estimate - Takes up 1 column on LG displays, full width on small */}
        <div className="lg:col-span-1 flex flex-col">
          <EstimateCard
            title="ESTIMATED DAYS&#10;TO MAX ACCOUNT"
            days={estimate.maxDays}
            borderColor="var(--brawl-cyan)"
            borderColorDim="rgba(20,255,255,0.2)"
            bgOuter="rgba(2, 6, 23, 0.9)"
            bgInner="rgba(15, 23, 42, 0.95)"
            accentColor="var(--brawl-cyan)"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--brawl-cyan)] drop-shadow-[0_0_8px_rgba(20,20,255,0.8)]">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            }
          />
        </div>

        {/* Breakdown Grid - Takes up 2 columns on LG displays */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

          <StatBox
            title="Brawlers Unlocked"
            current={stats.brawlers_unlocked}
            max={stats.brawlers_unlocked}
            colorHex="#cbd5e1"
            valueLabel="unlocked"
            iconUrl="/brawler_portraits/Shelly_portrait.png"
          />

          <StatBox
            title="Coins Progress"
            current={estimate.currentCoins}
            max={estimate.nMaxCoins}
            colorHex="#facc15"
            iconUrl="/icons/icon_gold_1.png"
          />

          <StatBox
            title="PP Progress"
            current={estimate.currentPP}
            max={estimate.nMaxPP}
            colorHex="#ec4899"
            iconUrl="/icons/icon_powerpoint_pile.webp"
          />

          <StatBox
            title="Gadgets Unlocked"
            current={stats.total_gadgets}
            max={stats.brawlers_unlocked * 2}
            colorHex="#4ade80"
            iconUrl="/icons/gadget_base_empty.png"
          />

          <StatBox
            title="Star Powers"
            current={stats.total_star_powers}
            max={stats.brawlers_unlocked * 2}
            colorHex="#facc15"
            iconUrl="/icons/starpower_base01_empty.png"
          />

          <StatBox
            title="Gears Unlocked"
            current={stats.total_gears}
            max={stats.brawlers_unlocked * 2}
            colorHex="#22d3ee"
            iconUrl="/icons/gear_base_empty.png"
          />

          <StatBox
            title="Hypercharges"
            current={stats.total_hypercharges}
            max={stats.brawlers_unlocked}
            colorHex="#c084fc"
            iconUrl="/icons/hypercharge_base_empty.png"
          />

          <StatBox
            title="Buffies"
            current={stats.total_buffies}
            max={RELEASED_BUFFIES_BRAWLER_COUNT * 3}
            colorHex="#fb923c"
            iconUrl="/icons/vault_key_buffies.png"
          />

        </div>
      </div>

      {/* Bottleneck info at the bottom */}
      <div className="w-full mt-8 pt-6 border-t border-white/5">
        <div
          className="chamfer-sm p-4 bg-black/40 border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left"
          style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}
        >
          <div>
            <span className="text-[10px] text-[var(--brawl-text-dim)] font-bold uppercase tracking-[0.2em] block mb-1">Critical Restriction</span>
            <span className="text-xl font-display font-bold text-white uppercase tracking-wider">
              {estimate.daysCoins > estimate.daysPowerPoints ? 'Coins' : 'Power Points'} Bottleneck
            </span>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-[10px] text-[var(--brawl-text-dim)] font-bold uppercase tracking-[0.2em] block mb-1">Required Resources</span>
            <span className="text-xl font-display font-bold text-[var(--brawl-cyan)]">
              {num(Math.max(estimate.nMaxCoins - estimate.currentCoins, 0))} {estimate.daysCoins > estimate.daysPowerPoints ? 'Coins' : 'Power Points'}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
