"use client";

import { useState, useEffect } from "react";
import { toggleTracked, isTracked } from "@/app/actions";
import { useRouter } from "next/navigation";

interface TrackButtonProps {
  tag: string;
}

export default function TrackButton({ tag }: TrackButtonProps) {
  const [tracked, setTracked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    isTracked(tag).then(setTracked);
  }, [tag]);

  async function handleToggle() {
    if (tracked === null) return;
    setLoading(true);
    try {
      const res = await toggleTracked(tag);
      setTracked(res.status === 'tracked');
      router.refresh(); // Refresh to update any other server components if needed
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (tracked === null) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 chamfer-xs transition-all ${
        tracked 
          ? "bg-[var(--brawl-yellow)]/10 text-[var(--brawl-yellow)] border border-[var(--brawl-yellow)]/30 hover:bg-[var(--brawl-yellow)]/20" 
          : "bg-white/5 text-[var(--brawl-text-muted)] border border-white/10 hover:bg-white/10 hover:text-white"
      }`}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill={tracked ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {loading ? "..." : tracked ? "TRACKED" : "TRACK ACCOUNT"}
      </span>
    </button>
  );
}
