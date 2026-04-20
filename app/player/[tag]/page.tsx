interface PlayerPageProps {
  params: Promise<{ tag: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { tag } = await params;

  return (
    <main className="flex flex-col flex-1 items-center pt-28 px-4 sm:px-6 relative z-10">
        <div className="brawl-card p-8 sm:p-12 max-w-2xl w-full text-center">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--brawl-yellow)]">
            Player #{tag}
          </h1>
          <p className="text-[var(--brawl-text-muted)] mt-4">
            Dashboard coming soon — this page will show your full progression breakdown.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <div className="brawl-card p-4 flex-1">
              <div className="text-xs text-[var(--brawl-text-dim)] uppercase tracking-wider">Power Points</div>
              <div className="text-xl font-bold text-[var(--brawl-cyan)] mt-1">—</div>
            </div>
            <div className="brawl-card p-4 flex-1">
              <div className="text-xs text-[var(--brawl-text-dim)] uppercase tracking-wider">Coins to Max</div>
              <div className="text-xl font-bold text-[var(--brawl-yellow)] mt-1">—</div>
            </div>
            <div className="brawl-card p-4 flex-1">
              <div className="text-xs text-[var(--brawl-text-dim)] uppercase tracking-wider">Brawlers</div>
              <div className="text-xl font-bold text-[var(--brawl-green)] mt-1">—</div>
            </div>
          </div>
        </div>
      </main>
    );
  }
