"use client";

import TagInput from "@/components/TagInput";
import EstimateCard from "@/components/EstimateCard";
import Image from "next/image";



export default function LandingHero() {
  return (
    <section className="flex flex-col items-center pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
      {/* Hero heading — plain bold, no glow text */}
      <div className="text-center max-w-2xl mx-auto animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight tracking-wide text-[var(--brawl-text)]">
          Find out how long it will take you to max out your account!
        </h1>
      </div>

      {/* Tag input — chamfered teal glow bar */}
      <div className="w-full max-w-2xl mt-10 animate-fade-in-up-delay-1">
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
          title="Buy Every Brawl Pass"
          days={1095}
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
          title={`Buy Every Offer\nand Battle Pass`}
          days={343}
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

      {/* Subtle CTA */}
      <div className="mt-12 text-center animate-fade-in-up-delay-3">
        <p className="text-sm text-[var(--brawl-text-muted)]">
          Sign up to track your account&apos;s progression and get more accurate estimations
        </p>
        <button className="chamfer-btn-secondary chamfer-xs mt-4" id="cta-signup-btn">
          <div className="btn-inner chamfer-xs !py-2 !text-sm">
            Create Account
          </div>
        </button>
      </div>
    </section>
  );
}
