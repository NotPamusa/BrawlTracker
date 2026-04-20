"use client";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="w-full inset-panel-top mt-auto relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo / Brand */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-display font-bold tracking-wide text-[var(--brawl-text)]">
              BrawlTo<span className="text-[var(--brawl-yellow)]">MAX</span>
            </span>
          </div>

          {/* Links - actual pages to be decided */}
          <div className="flex gap-8 text-sm font-bold uppercase tracking-wider">
            <button
              className="text-[var(--brawl-text-muted)] hover:text-[var(--brawl-cyan)] transition-colors cursor-pointer bg-transparent border-none"
              onClick={() => { }} // Future: Contact Us
            >
              Contact
            </button>
            <button
              className="text-[var(--brawl-text-muted)] hover:text-[var(--brawl-cyan)] transition-colors cursor-pointer bg-transparent border-none"
              onClick={() => { }} // Future: About
            >
              About
            </button>
          </div>

          {/* Socials / Connections - links to be added */}
          <div className="flex gap-4">
            <div className="chamfer-btn-secondary chamfer-xs">
              <div className="btn-inner chamfer-xs !py-2 !px-3">
                <span className="text-xs font-bold">X</span>
              </div>
            </div>
            <div className="chamfer-btn-secondary chamfer-xs">
              <div className="btn-inner chamfer-xs !py-2 !px-3">
                <span className="text-xs font-bold">DS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--brawl-border-dim)] flex flex-col sm:flex-row justify-between items-center gap-4 text-[var(--brawl-text-dim)] text-[10px] font-bold uppercase tracking-[0.2em]">
          <span>This content is not affiliated with Supercell. For more information see{" "}
            <a
              href="https://supercell.com/en/fan-content-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brawl-cyan)] hover:underline"
            >
              Supercell's Fan Policy
            </a>
          </span>
          <span className="text-[var(--brawl-text-muted)] group">
            Made by <span className="text-[var(--brawl-cyan)]">PAMUSA</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
