"use client";

import { useState, useRef, useEffect } from "react";
import valueConversions from "@/data/valueConversions.json";
import { useSettings } from "@/context/SettingsContext";
import { PlayerStats } from "@/utils/brawlAPI";

export default function CalculatorSettings({ player }: { player: PlayerStats }) {
  const { settings, applyTuning } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for the form, initialized from context settings
  const [dailyActivityChoice, setDailyActivityChoice] = useState((settings.dailyActivityChoice ?? 1).toString());
  const [eventsChoice, setEventsChoice] = useState(settings.eventsChoice ?? "always");
  const [finishQuests, setFinishQuests] = useState(settings.finishQuests ?? true);

  const [monthlySpending, setMonthlySpending] = useState(settings.monthlySpending > 0 ? settings.monthlySpending.toString() : "");
  const [currency, setCurrency] = useState(settings.currency ?? "USD");
  const [moneyEfficiencyChoice, setMoneyEfficiencyChoice] = useState((settings.moneyEfficiencyChoice ?? 1).toString());
  const [gemEfficiencyChoice, setGemEfficiencyChoice] = useState((settings.gemEfficiencyChoice ?? 1).toString());

  const [isRankedPlayer, setIsRankedPlayer] = useState(settings.isRankedPlayer ?? false);
  const [esportsRewards, setEsportsRewards] = useState(settings.esportsRewards ?? false);

  const [nBrawlPass_regular, setNBrawlPass_regular] = useState((settings.nBrawlPass_regular ?? 0) * 12);
  const [nBrawlPass_plus, setNBrawlPass_plus] = useState((settings.nBrawlPass_plus ?? 0) * 12);
  const [nRankedPass_free, setNRankedPass_free] = useState((settings.nRankedPass_free ?? 1) * 4);
  const [nRankedPass_regular, setNRankedPass_regular] = useState((settings.nRankedPass_regular ?? 0) * 4);

  const [stash, setStash] = useState<Record<string, number>>(settings.stash);

  // Sync local state if context settings change externally (e.g. on mount/load from storage)
  useEffect(() => {
    setDailyActivityChoice((settings.dailyActivityChoice ?? 1).toString());
    setEventsChoice(settings.eventsChoice ?? "always");
    setFinishQuests(settings.finishQuests ?? true);
    setMonthlySpending(settings.monthlySpending > 0 ? settings.monthlySpending.toString() : "");
    setCurrency(settings.currency ?? "USD");
    setMoneyEfficiencyChoice((settings.moneyEfficiencyChoice ?? 1).toString());
    setGemEfficiencyChoice((settings.gemEfficiencyChoice ?? 1).toString());
    setIsRankedPlayer(settings.isRankedPlayer ?? false);
    setEsportsRewards(settings.esportsRewards ?? false);
    setNBrawlPass_regular((settings.nBrawlPass_regular ?? 0) * 12);
    setNBrawlPass_plus((settings.nBrawlPass_plus ?? 0) * 12);
    setNRankedPass_free((settings.nRankedPass_free ?? 1) * 4);
    setNRankedPass_regular((settings.nRankedPass_regular ?? 0) * 4);
    setStash(settings.stash ?? {});
  }, [settings]);

  const handleStashChange = (key: string, val: string) => {
    const num = parseInt(val, 10);
    setStash(prev => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num
    }));
  };

  const stashKeys = Object.keys(valueConversions).filter(k => k !== "" && k !== "xp" && k !== "megaBox");

  const close = () => setIsOpen(false);

  const handleApply = () => {
    applyTuning({
      dailyActivityChoice: parseFloat(dailyActivityChoice),
      eventsChoice,
      finishQuests,
      monthlySpending: parseFloat(monthlySpending) || 0,
      currency,
      moneyEfficiencyChoice: parseFloat(moneyEfficiencyChoice),
      gemEfficiencyChoice: parseFloat(gemEfficiencyChoice),
      isRankedPlayer,
      esportsRewards,
      nBrawlPass_regular: nBrawlPass_regular / 12,
      nBrawlPass_plus: nBrawlPass_plus / 12,
      nRankedPass_free: nRankedPass_free / 4,
      nRankedPass_regular: nRankedPass_regular / 4,
      nBrawlPass_free: (12 - nBrawlPass_regular - nBrawlPass_plus) / 12,
      stash
    });
    close();
  };

  // Prevent scroll on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <>
      <div className="relative w-full group">
        {/* Button Depth */}
        <div className="absolute inset-0 translate-y-1.5 bg-[var(--brawl-blue-dark)] chamfer-sm shadow-lg" />

        <button
          onClick={() => setIsOpen(true)}
          className="relative w-full chamfer-sm p-[2px] bg-white/20 hover:bg-white/40 active:translate-y-1 transition-all flex"
        >
          <div className="chamfer-sm w-full p-4 bg-gradient-to-b from-[var(--brawl-blue)] to-[var(--brawl-blue-dark)] text-white font-display font-black text-lg tracking-wider flex items-center justify-center gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-[spin_10s_linear_infinite] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] uppercase">CALCULATOR SETTINGS & STASH</span>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex justify-center items-center p-4 bg-black/80 backdrop-blur-md overflow-hidden">
          <div className="relative w-full max-w-2xl animate-fade-in-up">
            {/* Pop-up Border Wrapper */}
            <div className="chamfer-md bg-white/20 p-[2px] shadow-[0_0_80px_rgba(0,0,0,0.9)]">
              <div className="chamfer-md w-full bg-[var(--brawl-bg-card)] relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 bg-white/5 border-b-2 border-white/10 flex justify-between items-center z-10 backdrop-blur-md">
                  <h2 className="text-2xl font-display font-black text-[var(--brawl-yellow)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase tracking-normal">PREDICTION TUNING</h2>
                  <button
                    onClick={close}
                    className="w-10 h-10 flex items-center justify-center bg-red-500/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all text-2xl font-black shadow-inner border border-red-500/30 active:scale-90"
                  >
                    ×
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 pb-12 space-y-10 overflow-y-auto custom-scrollbar flex-1">
                  {/* Play Rate Section */}
                  <section className="space-y-6">
                    <h3 className="text-xl font-display font-black text-white border-b-2 border-[var(--brawl-blue)] pb-1 inline-block uppercase tracking-normal">Activity Profile</h3>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-white uppercase tracking-wide block">How often do you play?</label>
                      <div className="chamfer-sm p-[1.5px] bg-white/10 focus-within:bg-[var(--brawl-cyan)] transition-colors">
                        <div className="chamfer-sm bg-black/60">
                          <select
                            value={dailyActivityChoice}
                            onChange={e => setDailyActivityChoice(e.target.value)}
                            className="w-full bg-transparent p-3 text-white font-bold outline-none appearance-none"
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value="1">1+ hours every day</option>
                            <option value="0.95">6+ wins almost every day</option>
                            <option value="0.8">5-6 days a week</option>
                            <option value="0.6">4 days a week</option>
                            <option value="0.5">Only weekends and days off</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-white uppercase tracking-wide block">Do you complete challenges and recurring events?</label>
                      <div className="chamfer-sm p-[1.5px] bg-white/10 focus-within:bg-[var(--brawl-cyan)] transition-colors">
                        <div className="chamfer-sm bg-black/60">
                          <select
                            value={eventsChoice}
                            onChange={e => setEventsChoice(e.target.value)}
                            className="w-full bg-transparent p-3 text-white font-bold outline-none appearance-none"
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value="always">Almost always</option>
                            <option value="challenges">Primarily challenges</option>
                            <option value="events">Primarily events</option>
                            <option value="sometimes">Sometimes</option>
                            <option value="rarely">Rarely</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-4 cursor-pointer group bg-black/20 p-4 rounded-lg border border-white/5 hover:border-white/20 transition-all">
                      <div className="relative flex items-center justify-center w-8 h-8 border-2 border-white/20 rounded-md bg-black/40 group-hover:border-[var(--brawl-cyan)] transition-colors">
                        <input
                          type="checkbox"
                          checked={finishQuests}
                          onChange={e => setFinishQuests(e.target.checked)}
                          className="peer sr-only"
                        />
                        <svg className="w-6 h-6 text-[var(--brawl-cyan)] opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-sm font-black text-white uppercase tracking-normal">Finish all quests at season end?</span>
                    </label>
                  </section>

                  {/* Money Section */}
                  <section className="space-y-8">
                    <h3 className="text-xl font-display font-black text-white border-b-2 border-[var(--brawl-yellow)] pb-1 inline-block uppercase tracking-normal">Passes & Spending</h3>

                    <div className="space-y-4">
                      <label className="text-sm font-black text-white uppercase tracking-wide block">How many Brawl Passes do you buy yearly?</label>
                      <BrawlPassSlider bpMonths={nBrawlPass_regular} setBpMonths={setNBrawlPass_regular} bppMonths={nBrawlPass_plus} setBppMonths={setNBrawlPass_plus} />
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                          <span className="text-[10px] font-black text-yellow-500 block uppercase mb-1">Regular BP</span>
                          <span className="text-xl font-display font-black text-white leading-none">{nBrawlPass_regular}</span>
                        </div>
                        <div className="bg-orange-500/10 p-2 rounded border border-orange-500/20">
                          <span className="text-[10px] font-black text-orange-400 block uppercase mb-1">Free Pass</span>
                          <span className="text-xl font-display font-black text-white leading-none">{12 - nBrawlPass_regular - nBrawlPass_plus}</span>
                        </div>
                        <div className="bg-gray-400/10 p-2 rounded border border-gray-400/20">
                          <span className="text-[10px] font-black text-gray-400 block uppercase mb-1">BP Plus</span>
                          <span className="text-xl font-display font-black text-white leading-none">{nBrawlPass_plus}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                      <div className="flex-1 space-y-3">
                        <label className="text-sm font-black text-white uppercase tracking-wide block">How many Ranked Passes do you buy yearly?</label>
                        <RankedPassSlider freeMonths={nRankedPass_free} setFreeMonths={setNRankedPass_free} regMonths={nRankedPass_regular} setRegMonths={setNRankedPass_regular} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 min-w-[120px]">
                        <div className="bg-purple-500/10 p-2 rounded border border-purple-500/20 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black text-purple-400 uppercase mb-1 leading-none text-center">REGULAR</span>
                          <span className="text-xl font-display font-black text-white leading-none">{nRankedPass_regular}</span>
                        </div>
                        <div className="bg-gray-500/10 p-2 rounded border border-gray-500/20 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase mb-1 leading-none text-center">FREE</span>
                          <span className="text-xl font-display font-black text-white leading-none">{nRankedPass_free}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-white uppercase tracking-wide block">Monthly spend outside passes</label>
                      <div className="flex gap-2">
                        <div className="chamfer-sm p-[1.5px] bg-white/10 focus-within:bg-[var(--brawl-cyan)] transition-colors">
                          <div className="chamfer-sm bg-black/60">
                            <select
                              value={currency}
                              onChange={e => setCurrency(e.target.value)}
                              className="bg-transparent p-3 text-white font-black outline-none appearance-none min-w-[70px] text-center"
                              style={{ backgroundImage: 'none' }}
                            >
                              <option value="USD">$</option>
                              <option value="EUR">€</option>
                              <option value="GBP">£</option>
                              <option value="BRL">R$</option>
                            </select>
                          </div>
                        </div>
                        <div className="relative flex-1 chamfer-sm p-[1.5px] bg-white/10 focus-within:bg-[var(--brawl-cyan)] transition-colors">
                          <div className="chamfer-sm bg-black/60">
                            <input
                              type="number"
                              min="0"
                              placeholder="0.00"
                              value={monthlySpending}
                              onChange={e => setMonthlySpending(e.target.value)}
                              className="w-full bg-transparent p-3 text-white font-black outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-white uppercase tracking-wide block">
                        {Number(monthlySpending) > 0 ? "How do you spend your money outside battle passes?" : "If you were to spend money outside passes, what would you buy?"}
                      </label>
                      <div className="chamfer-sm p-[1.5px] bg-white/10 focus-within:bg-[var(--brawl-cyan)] transition-colors">
                        <div className="chamfer-sm bg-black/60">
                          <select
                            value={moneyEfficiencyChoice}
                            onChange={e => setMoneyEfficiencyChoice(e.target.value)}
                            className="w-full bg-transparent p-3 text-white font-bold outline-none appearance-none"
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value="1">Only highest efficiency resource offers (gems &gt;30% off, coins/pwp 80+% off)</option>
                            <option value="0.8">High efficiency offers for resources</option>
                            <option value="0.6">High efficiency offers for resources and skins</option>
                            <option value="0.2">Mostly skins</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-white uppercase tracking-wide block">How do you spend your gems?</label>
                      <div className="chamfer-sm p-[1.5px] bg-white/10 focus-within:bg-[var(--brawl-cyan)] transition-colors">
                        <div className="chamfer-sm bg-black/60">
                          <select
                            value={gemEfficiencyChoice}
                            onChange={e => setGemEfficiencyChoice(e.target.value)}
                            className="w-full bg-transparent p-3 text-white font-bold outline-none appearance-none"
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value="1">Only highest efficiency offers (like hypercharge for 79 gems)</option>
                            <option value="0.8">High efficiency offers for resources</option>
                            <option value="0.6">High efficiency offers for resources and skins</option>
                            <option value="0.2">Mostly skins</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Ranked Section */}
                  <section className="space-y-6 pt-4 border-t border-white/5">
                    <h3 className="text-xl font-display font-black text-white border-b-2 border-purple-500 pb-1 inline-block uppercase tracking-normal">Competitive Stats</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                      <label className="flex items-center gap-4 cursor-pointer group bg-black/20 p-4 rounded-lg border border-white/5 hover:border-purple-500/50 transition-all h-full">
                        <div className="relative flex items-center justify-center w-8 h-8 border-2 border-white/20 rounded-md bg-black/40 group-hover:border-purple-400 transition-colors">
                          <input
                            type="checkbox"
                            checked={isRankedPlayer}
                            onChange={e => setIsRankedPlayer(e.target.checked)}
                            className="peer sr-only"
                          />
                          <svg className="w-6 h-6 text-purple-400 opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white uppercase tracking-normal leading-tight">Play Ranked often?</span>
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Peak Rank: {(() => {
                            const apiRank = player.highestRank ?? 10;
                            const ranks = ["Bronze", "Silver", "Gold", "Diamond", "Mythic", "Legendary", "Masters"];
                            const rankIdx = apiRank === 19 ? 6 : Math.min(6, Math.floor((apiRank - 1) / 3));
                            return ranks[rankIdx];
                          })()} (auto)</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-4 cursor-pointer group bg-black/20 p-4 rounded-lg border border-white/5 hover:border-yellow-500/50 transition-all h-full max-h-[76px]">
                        <div className="relative flex items-center justify-center w-8 h-8 border-2 border-white/20 rounded-md bg-black/40 group-hover:border-yellow-400 transition-colors">
                          <input
                            type="checkbox"
                            checked={esportsRewards}
                            onChange={e => setEsportsRewards(e.target.checked)}
                            className="peer sr-only"
                          />
                          <svg className="w-6 h-6 text-yellow-400 opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className="text-sm font-black text-white uppercase tracking-normal">Brawl Esports rewards?</span>
                      </label>
                    </div>
                  </section>

                  {/* Stash Section */}
                  <section className="space-y-6 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between border-b-2 border-orange-500 pb-1">
                      <h3 className="text-xl font-display font-black text-white uppercase tracking-normal">Offline Stash</h3>
                      <span className="text-[10px] font-black bg-orange-500 text-black px-2 py-0.5 rounded animate-pulse">HIDDEN DATA</span>
                    </div>
                    <p className="text-xs font-bold text-[var(--brawl-text-dim)] uppercase leading-relaxed">Input resources held in your account that the API cannot detect (unclaimed boxes, bank, etc).</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {stashKeys.map(key => (
                        <div key={key} className="space-y-2 group">
                          <label className="text-[10px] font-black text-[var(--brawl-text-dim)] uppercase tracking-widest group-hover:text-white transition-colors block">{key}</label>
                          <div className="chamfer-sm p-[1.5px] bg-white/5 focus-within:bg-orange-500 transition-all shadow-inner">
                            <div className="chamfer-sm bg-black/60 flex items-center">
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={stash[key] === 0 ? '' : stash[key] || ''}
                                onChange={e => handleStashChange(key, e.target.value)}
                                className="w-full bg-transparent p-2.5 text-white font-black outline-none text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end gap-4 relative z-20">
                  <button
                    onClick={handleApply}
                    className="chamfer-sm px-10 py-4 bg-gradient-to-b from-[var(--brawl-green)] to-[var(--brawl-green-dark,rgba(0,120,0,1))] text-white font-display font-black text-xl tracking-widest hover:brightness-110 active:translate-y-[2px] active:shadow-none transition-all shadow-[0_8px_0_rgba(0,0,0,0.5),0_8px_0_var(--brawl-green-dark,rgba(0,100,0,1))] border-t-2 border-white/20 uppercase"
                  >
                    APPLY TUNING
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Custom Double Range Slider for Brawl Pass
function BrawlPassSlider({ bpMonths, setBpMonths, bppMonths, setBppMonths }: any) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent, type: 'bp' | 'bpp') => {
    e.preventDefault();
    if (!trackRef.current) return;

    const track = trackRef.current;

    const handleMove = (moveEv: PointerEvent) => {
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (moveEv.clientX - rect.left) / rect.width));
      const val = Math.round(pct * 12);

      if (type === 'bp') {
        const newVal = Math.min(val, 12 - bppMonths);
        setBpMonths(newVal);
      } else {
        const newVal = 12 - Math.max(val, bpMonths);
        setBppMonths(newVal);
      }
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const handleTrackPointerDown = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const val = Math.round(pct * 12);

    const bpPos = bpMonths;
    const bppPos = 12 - bppMonths;

    let type: 'bp' | 'bpp';
    if (val <= bpPos) {
      // Clicking to the left of (or on) the BP handle
      type = 'bp';
    } else if (val >= bppPos) {
      // Clicking to the right of (or on) the BPP handle
      type = 'bpp';
    } else {
      // In between handles, move the closer one
      const distBP = Math.abs(val - bpPos);
      const distBPP = Math.abs(val - bppPos);
      type = distBP <= distBPP ? 'bp' : 'bpp';
    }

    if (type === 'bp') {
      setBpMonths(Math.min(val, 12 - bppMonths));
    } else {
      setBppMonths(12 - Math.max(val, bpMonths));
    }

    handlePointerDown(e, type);
  };

  const bpWidth = (bpMonths / 12) * 100;
  const bppWidth = (bppMonths / 12) * 100;
  const freeWidth = 100 - bpWidth - bppWidth;

  return (
    <div className="relative w-full h-12 flex items-center select-none py-2 cursor-pointer" ref={trackRef} onPointerDown={handleTrackPointerDown}>
      {/* Background Track */}
      <div className="absolute left-0 right-0 h-4 flex overflow-hidden rounded-full border-2 border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] bg-[#5d3b1e]">
        {/* Regular BP Bar - Shiny Gold */}
        <div
          style={{ width: `${bpWidth}%` }}
          className="h-full bg-gradient-to-b from-[#ffef00] via-[#ffd700] to-[#b8860b] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[sweep_2s_infinite]" />
        </div>
        {/* Free Bar - Bronze */}
        <div style={{ width: `${freeWidth}%` }} className="h-full bg-gradient-to-b from-[#cd7f32] to-[#8b4513]" />
        {/* BP Plus Bar - Shiny Silver */}
        <div
          style={{ width: `${bppWidth}%` }}
          className="h-full bg-gradient-to-b from-[#f8f9fa] via-[#e9ecef] to-[#adb5bd] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] animate-[sweep_1.5s_infinite]" />
        </div>
      </div>

      {/* BP Thumb */}
      <div
        className="absolute w-10 h-10 bg-yellow-400 border-2 border-yellow-200 cursor-grab active:cursor-grabbing z-20 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center overflow-hidden"
        style={{ left: `calc(${bpWidth}% - 20px)` }}
        onPointerDown={e => {
          e.stopPropagation();
          handlePointerDown(e, 'bp');
        }}
      >
        <img src="/icons/icon_brawl_pass.png" className="w-8 h-8 object-contain" alt="BP" />
      </div>

      {/* BPP Thumb */}
      <div
        className="absolute w-10 h-10 bg-gray-200 border-2 border-white cursor-grab active:cursor-grabbing z-20 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center overflow-hidden"
        style={{ right: `calc(${bppWidth}% - 20px)` }}
        onPointerDown={e => {
          e.stopPropagation();
          handlePointerDown(e, 'bpp');
        }}
      >
        <img src="/icons/icon_brawl_pass_plus.png" className="w-8 h-8 object-contain" alt="BPP" />
      </div>
    </div>
  );
}

// Double Range Slider for Ranked Pass
function RankedPassSlider({ freeMonths, setFreeMonths, regMonths, setRegMonths }: any) {
  const trackRef = useRef<HTMLDivElement>(null);
  const nYearlyRankedPasses = 4;
  const handlePointerDown = (e: React.PointerEvent, type: 'free' | 'reg') => {
    e.preventDefault();
    if (!trackRef.current) return;

    const track = trackRef.current;

    const handleMove = (moveEv: PointerEvent) => {
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (moveEv.clientX - rect.left) / rect.width));
      const val = Math.round(pct * nYearlyRankedPasses);

      if (type === 'reg') {
        const newVal = Math.min(val, nYearlyRankedPasses);
        setRegMonths(newVal);
        setFreeMonths(nYearlyRankedPasses - newVal);
      } else {
        const newVal = Math.min(val, nYearlyRankedPasses);
        setFreeMonths(newVal);
        setRegMonths(nYearlyRankedPasses - newVal);
      }
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const handleTrackPointerDown = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const val = Math.round(pct * nYearlyRankedPasses);

    // Simple toggle/move based on side
    if (val < 6) {
      setRegMonths(val);
      setFreeMonths(nYearlyRankedPasses - val);
    } else {
      setFreeMonths(nYearlyRankedPasses - val);
      setRegMonths(val);
    }
  };

  const regWidth = (regMonths / nYearlyRankedPasses) * 100;
  const freeWidth = (freeMonths / nYearlyRankedPasses) * 100;

  return (
    <div className="relative w-full h-12 flex items-center select-none py-2 cursor-pointer" ref={trackRef} onPointerDown={handleTrackPointerDown}>
      {/* Background Track */}
      <div className="absolute left-0 right-0 h-4 flex overflow-hidden rounded-full border-2 border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] bg-black/60">
        <div
          style={{ width: `${regWidth}%` }}
          className="h-full bg-gradient-to-b from-purple-400 to-purple-800 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-[sweep_2.5s_infinite]" />
        </div>
        <div
          style={{ width: `${freeWidth}%` }}
          className="h-full bg-gradient-to-b from-gray-400 to-gray-700"
        />
      </div>

      {/* Thumb */}
      <div
        className="absolute w-10 h-10 bg-purple-500 border-2 border-purple-200 cursor-grab active:cursor-grabbing z-20 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center overflow-hidden"
        style={{ left: `calc(${regWidth}% - 20px)` }}
        onPointerDown={e => {
          e.stopPropagation();
          handlePointerDown(e, 'reg');
        }}
      >
        <img src="/icons/icon_pro_pass_icon.png" className="w-8 h-8 object-contain" alt="RANKED" />
      </div>
    </div>
  );
}
