"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
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
          className="flex items-center shrink-0 cursor-pointer bg-transparent border-none"
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

          {/* Login button — hexagonal */}
          <div className="hex-btn-wrap shrink-0">
            <button
              className="hex-btn"
              id="nav-login-btn"
            >
              <div className="hex-btn-inner text-sm">
                Log&nbsp;In
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
