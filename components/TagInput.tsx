"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TagInputProps {
  /** Large hero-style variant or compact variant */
  variant?: "hero" | "compact";
}

export default function TagInput({ variant = "hero" }: TagInputProps) {
  const router = useRouter();
  const [tag, setTag] = useState("");

  function handleTagChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.toUpperCase().replace(/\s/g, "");
    if (val === "") {
      setTag("");
      return;
    }
    if (!val.startsWith("#")) {
      val = "#" + val;
    }
    val = "#" + val.slice(1).replace(/#/g, "");
    setTag(val);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = tag.replace("#", "").trim().toUpperCase();
    if (cleaned.length > 0) {
      router.push(`/player/${cleaned}`);
    }
  }

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto" id="hero-tag-form">
        {/* Chamfered search bar with teal border + glow */}
        <div className="hero-search-wrap animate-search-glow w-full">
          <div className="hero-search-border chamfer-md">
            <div className="hero-search-bg chamfer-sm flex items-center">
              <input
                type="text"
                value={tag}
                onChange={handleTagChange}
                placeholder="ENTER YOUR PLAYER CODE..."
              className="
                flex-1 bg-transparent border-none outline-none
                text-white font-display font-bold text-lg sm:text-xl
                tracking-widest py-4 sm:py-5 px-5
                placeholder:text-[var(--brawl-text-dim)]
                placeholder:font-display placeholder:font-bold
                placeholder:tracking-[0.15em]
              "
              id="hero-tag-input"
            />
            <button
              type="submit"
              className="
                flex items-center justify-center
                text-[var(--brawl-text-dim)] hover:text-[var(--brawl-cyan)]
                transition-colors cursor-pointer
                px-5 py-4
                bg-transparent border-none
              "
              id="hero-tag-submit"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            </div>
          </div>
        </div>
      </form>
    );
  }

  // Compact variant
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full" id="compact-tag-form">
      <div className="relative flex-1">
        <div className="chamfer-input-wrap chamfer-xs w-full">
          <div className="chamfer-input-bg chamfer-xs flex items-center">
            <input
              type="text"
              value={tag}
              onChange={handleTagChange}
              placeholder="Player tag..."
              className="chamfer-input-core py-2 pl-3 text-sm font-semibold"
              id="compact-tag-input"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="chamfer-btn-primary chamfer-xs"
        id="compact-tag-submit"
      >
        <div className="btn-inner chamfer-xs !py-2 !px-4 !text-sm">
          Search
        </div>
      </button>
    </form>
  );
}
