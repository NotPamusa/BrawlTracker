export default function Loading() {
  return (
    <main className="fixed inset-0 z-[100] bg-[var(--brawl-bg-deep)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Classic Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-[var(--brawl-cyan)] rounded-full animate-spin"></div>
        </div>
        
        {/* Classic Loading Text */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-[0.2em] drop-shadow-md">
            Loading...
          </h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-[var(--brawl-cyan)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-[var(--brawl-cyan)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-[var(--brawl-cyan)] rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
