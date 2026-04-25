"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface TagInputProps {
  /** Large hero-style variant or compact variant */
  variant?: "hero" | "compact";
}

export default function TagInput({ variant = "hero" }: TagInputProps) {
  const router = useRouter();
  const supabase = createClient();
  const [tag, setTag] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [trackedTags, setTrackedTags] = useState<string[]>([]);
  const [linkedTag, setLinkedTag] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Load history from localStorage
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // 2. Fetch user data
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        
        // Fetch linked tag
        supabase
          .from('profiles')
          .select('player_tag, is_verified')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile?.is_verified && profile.player_tag) {
              setLinkedTag(profile.player_tag);
            }
          });

        // Fetch tracked accounts
        supabase
          .from('tracked_accounts')
          .select('player_tag')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .then(({ data: tracked }) => {
            if (tracked) setTrackedTags(tracked.map(t => t.player_tag));
          });

        // Fetch DB history
        supabase
          .from('search_history')
          .select('player_tag')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
          .then(({ data: dbHistory }) => {
            if (dbHistory && dbHistory.length > 0) {
              const tags = dbHistory.map(h => h.player_tag);
              setHistory(tags);
              localStorage.setItem("searchHistory", JSON.stringify(tags.slice(0, 5)));
            }
          });
      }
    });

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [supabase]);

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
    setShowDropdown(true);
  }

  async function saveToHistory(newTag: string) {
    const cleaned = newTag.replace("#", "").trim().toUpperCase();
    if (cleaned === linkedTag || trackedTags.includes(cleaned)) return;

    let newHistory = history.filter(t => t !== cleaned);
    newHistory = [cleaned, ...newHistory].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory.slice(0, 5)));

    if (user) {
      await supabase
        .from('search_history')
        .upsert({ user_id: user.id, player_tag: cleaned }, { onConflict: 'user_id, player_tag' });
    }
  }

  function handleSubmit(e?: React.FormEvent, selectedTag?: string) {
    if (e) e.preventDefault();
    const finalTag = selectedTag || tag;
    const cleaned = finalTag.replace("#", "").trim().toUpperCase();
    if (cleaned.length > 0) {
      saveToHistory(cleaned);
      setShowDropdown(false);
      router.push(`/player/${cleaned}`);
    }
  }

  const searchFilter = tag.replace("#", "").toUpperCase();
  const filteredHistory = history.filter(t => searchFilter === "" || t.includes(searchFilter));
  const showLinked = linkedTag && (searchFilter === "" || linkedTag.includes(searchFilter));
  const filteredTracked = trackedTags.filter(t => searchFilter === "" || t.includes(searchFilter));
  const hasResults = showLinked || filteredHistory.length > 0 || filteredTracked.length > 0;

  return (
    <div className="relative w-full z-[60]" ref={dropdownRef}>
      {variant === "hero" ? (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto" id="hero-tag-form">
          <div className="hero-search-wrap animate-search-glow w-full">
            <div className="hero-search-border chamfer-md">
              <div className="hero-search-bg chamfer-sm flex items-center">
                <input
                  type="text"
                  value={tag}
                  onChange={handleTagChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="ENTER YOUR PLAYER CODE..."
                  className="flex-1 bg-transparent border-none outline-none text-white font-display font-bold text-lg sm:text-xl tracking-widest py-4 sm:py-5 px-5 placeholder:text-[var(--brawl-text-dim)] placeholder:font-display placeholder:font-bold placeholder:tracking-[0.15em]"
                  id="hero-tag-input"
                  autoComplete="off"
                />
                <button type="submit" className="flex items-center justify-center text-[var(--brawl-text-dim)] hover:text-[var(--brawl-cyan)] transition-colors cursor-pointer px-5 py-4 bg-transparent border-none" id="hero-tag-submit">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full" id="compact-tag-form">
          <div className="relative flex-1">
            <div className="chamfer-input-wrap chamfer-xs w-full">
              <div className="chamfer-input-bg chamfer-xs flex items-center">
                <input
                  type="text"
                  value={tag}
                  onChange={handleTagChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Player tag..."
                  className="chamfer-input-core py-2 pl-3 text-sm font-semibold"
                  id="compact-tag-input"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {showDropdown && hasResults && (
        <div className={`absolute z-[100] mt-1 bg-[var(--brawl-bg-elevated)] border border-[var(--brawl-border)] chamfer-sm shadow-xl overflow-hidden animate-fade-in-up ${
          variant === "compact" ? "right-0 min-w-[220px] w-max" : "w-full"
        }`}>
          <div className="p-1">
            {/* Linked Account */}
            {showLinked && (
              <button
                onClick={() => handleSubmit(undefined, linkedTag)}
                className={`w-full text-left px-4 hover:bg-white/5 flex items-center justify-between group transition-colors border-b border-[var(--brawl-border)] ${
                  variant === "compact" ? "py-2" : "py-3"
                }`}
              >
                <div className={`flex items-center gap-2 ${variant === "compact" ? "text-xs" : "text-lg"}`}>
                  <span className="text-[var(--brawl-cyan)] font-display font-bold tracking-widest">#{linkedTag}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brawl-cyan)] opacity-70 group-hover:opacity-100">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brawl-text-dim)] group-hover:text-[var(--brawl-cyan)]">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* Tracked Accounts */}
            {filteredTracked.map((t, i) => (
              <button
                key={`tracked-${i}`}
                onClick={() => handleSubmit(undefined, t)}
                className={`w-full text-left px-4 hover:bg-white/5 flex items-center justify-between group transition-colors border-b border-[var(--brawl-border-dim)] last:border-0 ${
                  variant === "compact" ? "py-1.5" : "py-2"
                }`}
              >
                <div className={`flex items-center gap-2 ${variant === "compact" ? "text-[11px]" : "text-base"}`}>
                  <span className="text-[var(--brawl-yellow)] font-bold tracking-widest">#{t}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[var(--brawl-yellow)] opacity-70 group-hover:opacity-100">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brawl-text-dim)] group-hover:text-[var(--brawl-yellow)]">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
            
            {/* Recent History */}
            {filteredHistory.filter(h => !trackedTags.includes(h)).map((h, i) => (
              <button
                key={`history-${i}`}
                onClick={() => handleSubmit(undefined, h)}
                className={`w-full text-left px-4 hover:bg-white/5 flex items-center justify-between group transition-colors ${
                  variant === "compact" ? "py-1.5 text-[11px]" : "py-2 text-base"
                }`}
              >
                <span className="text-[var(--brawl-text)] font-bold tracking-widest">#{h}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brawl-text-dim)] group-hover:text-white">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
