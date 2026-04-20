"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const [tag, setTag] = useState("");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = tag.replace("#", "").trim().toUpperCase();
    if (cleaned.length > 0) {
      router.push(`/player/${cleaned}`);
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 inset-panel">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center shrink-0 cursor-pointer bg-transparent border-none outline-none"
          id="nav-logo"
        >
          <span className="text-xl sm:text-2xl font-display font-bold tracking-wide text-[var(--brawl-text)]">
            BrawlTo<span className="text-[var(--brawl-yellow)]">MAX</span>
          </span>
        </button>

        <div className="flex items-center gap-4 ml-auto">
          {/* Ghost search input — chamfered */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-sm hidden sm:flex items-center"
            id="nav-search-form"
          >
            <div className="chamfer-input-wrap chamfer-xs w-full">
              <div className="chamfer-input-bg chamfer-xs flex items-center">
                <input
                  type="text"
                  value={tag}
                  onChange={handleTagChange}
                  placeholder="Search player tag #..."
                  className="chamfer-input-core py-2 pl-3 pr-3 text-sm font-semibold"
                  id="nav-tag-input"
                />
              </div>
            </div>
          </form>

          {/* User Auth Section */}
          {user ? (
            <div className="hex-btn-wrap shrink-0">
              <div 
                className="cursor-pointer" 
                onClick={() => router.push("/profile")} 
                id="nav-profile-btn"
              >
                <div className="chamfer-btn-primary chamfer-xs !p-[2px]">
                  <div className="btn-inner chamfer-xs !py-1.5 !px-3 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hex-btn-wrap shrink-0">
              <button
                className="hex-btn"
                id="nav-login-btn"
                onClick={() => router.push("/login")}
              >
                <div className="hex-btn-inner text-sm">
                  Log&nbsp;In
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
