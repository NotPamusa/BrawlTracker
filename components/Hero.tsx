"use client";

import { useEffect, useState } from "react";
import TagInput from "@/components/TagInput";
import EstimateCard from "@/components/EstimateCard";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Placeholder for linked account status
  const [linkedAccount, setLinkedAccount] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Fetch real profile data to check linked status
        supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile?.is_verified) {
              setLinkedAccount(true);
            }
          });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            setLinkedAccount(profile?.is_verified || false);
          });
      } else {
        setLinkedAccount(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <section className="flex flex-col items-center pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
      {/* Hero heading — plain bold, no glow text */}
      <div className="text-center max-w-2xl mx-auto animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight tracking-wide text-[var(--brawl-text)]">
          Find out how long it will take you to max out your account!
        </h1>
      </div>

      {/* Tag input — chamfered teal glow bar */}
      <div className="w-full max-w-2xl mt-10 animate-fade-in-up-delay-1 relative z-50">
        <TagInput variant="hero" />
      </div>

      {/* Section heading */}
      <div className="w-full max-w-4xl mt-16 mb-6 text-center animate-fade-in-up-delay-2">
        <h2 className="text-lg sm:text-xl font-display font-bold text-[var(--brawl-text)]">
          Time To Max for a Brand New Account
        </h2>
        <p className="text-sm text-[var(--brawl-text-muted)] mt-1">
          If you just started playing, this is how long it might take you:
        </p>
      </div>

      {/* Estimate cards — card-within-card, beveled */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl animate-fade-in-up-delay-3">
        <EstimateCard
          title="Free to Play"
          days={2950}
          disableGlow={true}
          borderColor="var(--card-free-border)"
          borderColorDim="var(--card-free-border-dim)"
          bgOuter="var(--card-free-bg)"
          bgInner="var(--card-free-bg-inner)"
          accentColor="var(--brawl-purple)"
          icon={
            <div className="flex items-center gap-1">
              <Image src="/icons/griff_sad_pin.png" alt="Free to Play" width={40} height={40} className="object-contain" style={{ width: "auto", height: "auto" }} />
            </div>
          }
        />

        <EstimateCard
          title="Buying Every Brawl Pass"
          days={1095}
          disableGlow={true}
          borderColor="var(--card-pass-border)"
          borderColorDim="var(--card-pass-border-dim)"
          bgOuter="var(--card-pass-bg)"
          bgInner="var(--card-pass-bg-inner)"
          accentColor="var(--brawl-yellow)"
          icon={
            <div className="flex items-center gap-1">
              <Image src="/icons/icon_brawl_pass.png" alt="Brawl Pass" width={40} height={40} className="object-contain" style={{ width: "auto", height: "auto" }} />
            </div>
          }
        />

        <EstimateCard
          title={`Buying Every BrawlPass+ and Pro Pass`}
          days={343}
          disableGlow={true}
          borderColor="var(--card-whale-border)"
          borderColorDim="var(--card-whale-border-dim)"
          bgOuter="var(--card-whale-bg)"
          bgInner="var(--card-whale-bg-inner)"
          accentColor="var(--brawl-green)"
          icon={
            <div className="flex items-center gap-2">
              <Image src="/icons/icon_brawl_pass_plus.png" alt="Brawl Pass Plus" width={40} height={40} className="object-contain" style={{ width: "auto", height: "auto" }} />
            </div>
          }
        />
      </div>

      {/* Dynamic CTA Section */}
      <div className="mt-12 w-full max-w-2xl text-center animate-fade-in-up-delay-3">
        {!loading && (
          <>
            {!user ? (
              /* Not Logged In - Create Account CTA */
              <div className="flex flex-col items-center">
                <p className="text-sm text-[var(--brawl-text-muted)]">
                  Sign up to track your account&apos;s progression and get more accurate estimations
                </p>
                <div className="hex-btn-wrap mt-4">
                  <button
                    className="hex-btn"
                    onClick={() => router.push("/login")}
                  >
                    <div className="hex-btn-inner !py-2 !px-8 !text-sm">
                      CREATE ACCOUNT
                    </div>
                  </button>
                </div>
              </div>
            ) : !linkedAccount ? (
              /* Logged In but No Linked Account - Link Account Panel (Smaller version) */
              <div className="bg-[var(--brawl-green)] chamfer-md p-[2px] shadow-[0_0_15px_rgba(76,255,80,0.1)] hover:shadow-[0_0_20px_rgba(76,255,80,0.2)] transition-shadow max-w-lg mx-auto">
                <div className="p-4 sm:p-5 chamfer-md bg-[var(--card-whale-bg)] relative text-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,255,80,0.1),transparent_70%)] pointer-events-none"></div>

                  <h3 className="relative z-10 text-lg font-display font-bold text-[var(--brawl-green)] uppercase tracking-wide">
                    Link Your Brawl Stars Account
                  </h3>
                  <p className="relative z-10 text-[10px] font-bold text-[var(--brawl-green)]/70 uppercase tracking-widest mt-0.5">
                    Connect profile to start tracking
                  </p>

                  <div className="hex-btn-wrap mt-3 relative z-10 inline-block">
                    <button
                      className="hex-btn !bg-[var(--brawl-green)]"
                      onClick={() => router.push("/profile")}
                    >
                      <div className="hex-btn-inner !text-[var(--brawl-green)] !bg-[var(--card-whale-bg-inner)] !py-1.5 !px-6 !text-[10px]">
                        LINK NOW
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : null /* Logged In & Linked - Show nothing */}
          </>
        )}
      </div>
    </section>
  );
}
