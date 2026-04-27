"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { fetchPlayer } from "@/app/actions";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // This is a placeholder for the linked account. Setting to null shows the CTA.
  const [linkedAccount, setLinkedAccount] = useState<any>(null);
  // e.g. { name: "PAMUSA", tag: "#P92LRCQJ" }

  const [username, setUsername] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        
        // Fetch real profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.player_tag && profile.is_verified) {
          const player = await fetchPlayer(profile.player_tag);
          if (player) {
            setLinkedAccount({
              name: player.name,
              tag: `#${profile.player_tag}`,
              icon: player.icon.id,
              trophies: player.trophies
            });
          }
        }
      }
      setLoading(false);
    });
  }, [router, supabase]);

  if (loading) return (
    <main className="flex flex-col flex-1 relative z-10 items-center pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
      <div className="w-full max-w-3xl animate-fade-in-up">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="skeleton-pulse chamfer-sm h-9 w-48 rounded" />
        </div>

        {/* Linked account banner skeleton */}
        <div className="mb-10">
          <div className="bg-[var(--brawl-border)] chamfer-md p-[2px]">
            <div className="chamfer-md bg-[var(--brawl-bg-elevated)] p-6 flex items-center gap-4">
              <div className="skeleton-pulse w-12 h-12 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="skeleton-pulse chamfer-xs h-3 w-20 rounded" />
                <div className="skeleton-pulse chamfer-xs h-6 w-40 rounded" />
                <div className="skeleton-pulse chamfer-xs h-3 w-32 rounded" />
              </div>
              <div className="skeleton-pulse chamfer-sm h-9 w-20 rounded shrink-0" />
            </div>
          </div>
        </div>

        {/* Two-column detail cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Account Details card */}
          <div className="bg-[var(--brawl-border)] chamfer-md p-[2px]">
            <div className="p-6 chamfer-md bg-[var(--brawl-bg-card)] flex flex-col gap-5">
              <div className="skeleton-pulse chamfer-xs h-3 w-32 rounded mb-1" />
              <div className="flex flex-col gap-2">
                <div className="skeleton-pulse chamfer-xs h-3 w-20 rounded" />
                <div className="skeleton-pulse chamfer-sm h-11 w-full rounded" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="skeleton-pulse chamfer-xs h-3 w-28 rounded" />
                <div className="skeleton-pulse chamfer-sm h-11 w-full rounded" />
              </div>
              <div className="mt-2 flex justify-end">
                <div className="skeleton-pulse chamfer-sm h-9 w-32 rounded" />
              </div>
            </div>
          </div>

          {/* Security card */}
          <div className="bg-[var(--brawl-border)] chamfer-md p-[2px]">
            <div className="p-6 chamfer-md bg-[var(--brawl-bg-card)] flex flex-col gap-5 h-full">
              <div className="skeleton-pulse chamfer-xs h-3 w-20 rounded mb-1" />
              <div className="flex flex-col gap-2">
                <div className="skeleton-pulse chamfer-xs h-3 w-20 rounded" />
                <div className="flex gap-2">
                  <div className="skeleton-pulse chamfer-sm h-11 flex-1 rounded" />
                  <div className="skeleton-pulse chamfer-sm h-11 w-20 rounded" />
                </div>
              </div>
              <div className="mt-auto pt-8">
                <div className="skeleton-pulse chamfer-sm h-11 w-full rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <main className="flex flex-col flex-1 relative z-10 items-center pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
      <div className="w-full max-w-3xl animate-fade-in-up">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-[var(--brawl-text)] uppercase tracking-wide">
            User profile
          </h1>
        </div>

        {/* Brawl Stars Linked Account Section - Horizontal Rectangular banner */}
        <div className="mb-10 animate-fade-in-up-delay-1">
          {linkedAccount ? (
            <div className="bg-[var(--brawl-cyan)] chamfer-md p-[2px] shadow-[0_0_15px_rgba(20,255,255,0.15)] overflow-hidden">
              <div className="p-6 chamfer-md bg-[var(--brawl-bg-elevated)] relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--brawl-cyan)] opacity-10 blur-3xl rounded-full"></div>

                <h2 className="text-xs text-[var(--brawl-text-muted)] font-bold uppercase tracking-widest mb-2">
                  Linked Game Profile
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                      <img 
                        src={`/profile_pictures/pfp_${linkedAccount.icon}.png`} 
                        alt="PFP" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-display text-2xl text-[var(--brawl-text)]">{linkedAccount.name}</p>
                      <p className="text-sm font-bold text-[var(--brawl-yellow)] tracking-wider">
                        {linkedAccount.tag} • 🏆 {linkedAccount.trophies.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      await supabase.from('profiles').update({ player_tag: null, is_verified: false }).eq('id', user.id);
                      setLinkedAccount(null);
                    }}
                    className="chamfer-btn-secondary chamfer-sm"
                  >
                    <div className="btn-inner chamfer-sm !py-2 !px-4 !text-xs">
                      UNLINK
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/link-account" className="block group">
              <div className="bg-[var(--brawl-green)] chamfer-md p-[2px] shadow-[0_0_15px_rgba(76,255,80,0.15)] group-hover:shadow-[0_0_25px_rgba(76,255,80,0.25)] transition-shadow">
                <div className="p-6 sm:p-8 chamfer-md bg-[var(--card-whale-bg)] relative text-center flex flex-col items-center justify-center gap-4">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,255,80,0.15),transparent_70%)] pointer-events-none"></div>

                  <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="w-12 h-12 mb-2 bg-[rgba(76,255,80,0.15)] rounded-full flex items-center justify-center text-[var(--brawl-green)]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--brawl-green)] uppercase tracking-wide">
                      Link Your Brawl Stars Account
                    </h2>
                    <p className="text-sm font-bold text-[var(--brawl-green)]/70 uppercase tracking-widest mt-1">
                      Connect profile to start tracking your progress
                    </p>
                  </div>

                  <div className="hex-btn-wrap mt-4 relative z-10">
                    <div className="hex-btn !bg-[var(--brawl-green)]">
                      <div className="hex-btn-inner !text-[var(--brawl-green)] !bg-[var(--card-whale-bg-inner)]">
                        LINK ACCOUNT NOW
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in-up-delay-2">

          {/* Account Info */}
          <div className="bg-[var(--brawl-border)] chamfer-md p-[2px]">
            <div className="p-6 chamfer-md bg-[var(--brawl-bg-card)]">
              <h3 className="text-[var(--brawl-text-muted)] text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-[var(--brawl-border-dim)]">
                Account Details
              </h3>

              <div className="flex flex-col gap-5">
                {/* Username */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[var(--brawl-text-muted)] uppercase tracking-wider font-bold">
                    Username
                  </label>
                  <div className="chamfer-input-wrap chamfer-sm w-full">
                    <div className="chamfer-input-bg chamfer-sm flex items-center">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Player123"
                        className="chamfer-input-core py-3 px-4 text-sm font-semibold placeholder:text-[var(--brawl-text-dim)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Email (Readonly) */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[var(--brawl-text-muted)] uppercase tracking-wider font-bold">
                    Registered Email
                  </label>
                  <div className="chamfer-input-wrap chamfer-sm w-full opacity-60 pointer-events-none">
                    <div className="chamfer-input-bg chamfer-sm flex items-center">
                      <input
                        type="email"
                        readOnly
                        value={user?.email || ""}
                        className="chamfer-input-core py-3 px-4 text-sm font-semibold text-[var(--brawl-text-dim)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--brawl-border-dim)] flex justify-end">
                <div className="hex-btn-wrap">
                  <button className="chamfer-btn-primary chamfer-sm">
                    <div className="btn-inner chamfer-sm !py-2 !px-6 !text-xs">
                      SAVE CHANGES
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-[var(--brawl-border)] chamfer-md p-[2px]">
            <div className="p-6 chamfer-md bg-[var(--brawl-bg-card)] flex flex-col h-full">
              <h3 className="text-[var(--brawl-text-muted)] text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-[var(--brawl-border-dim)]">
                Security
              </h3>

              <div className="flex flex-col gap-5 flex-1">
                {/* Password (Pseudo) */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[var(--brawl-text-muted)] uppercase tracking-wider font-bold">
                    Password
                  </label>
                  <div className="flex gap-2">
                    <div className="chamfer-input-wrap chamfer-sm w-full opacity-60 pointer-events-none">
                      <div className="chamfer-input-bg chamfer-sm flex items-center">
                        <input
                          type="password"
                          readOnly
                          value="••••••••••••"
                          className="chamfer-input-core py-3 px-4 text-sm font-bold tracking-widest text-[var(--brawl-text-dim)]"
                        />
                      </div>
                    </div>
                    <button className="chamfer-btn-secondary chamfer-sm shrink-0">
                      <div className="btn-inner chamfer-sm !py-3 !px-4 !text-xs">
                        CHANGE
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-8 flex flex-col items-start gap-4">
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push('/');
                      router.refresh();
                    }}
                    className="chamfer-btn-secondary chamfer-sm w-full"
                  >
                    <div className="btn-inner chamfer-sm !py-3 !text-sm flex items-center justify-center gap-2 hover:!text-[var(--brawl-red)] hover:!bg-[rgba(255,74,74,0.05)] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      SIGN OUT
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
