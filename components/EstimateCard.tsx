import CountUp from "@/components/CountUp";

interface EstimateCardProps {
  title: string;
  days: number;
  subtitle?: string;
  borderColor: string;
  borderColorDim: string;
  bgOuter: string;
  bgInner: string;
  accentColor: string;
  icon: React.ReactNode;
  disableGlow?: boolean;
  suppressFirstPulse?: boolean;
}

export default function EstimateCard({
  title,
  days,
  subtitle,
  borderColor,
  borderColorDim,
  bgOuter,
  bgInner,
  accentColor,
  icon,
  disableGlow,
  suppressFirstPulse,
}: EstimateCardProps) {
  return (
    <div
      className="group cursor-default transition-all duration-300 hover:translate-y-[-2px] h-full"
      style={{
        filter: `drop-shadow(0 0 20px ${accentColor}30)`,
      }}
    >
      {/* Outer Glow Border */}
      <div
        className="chamfer-md p-[3px] h-full flex flex-col relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${borderColor} 0%, ${borderColorDim} 40%, ${borderColorDim} 60%, ${borderColor} 100%)`,
        }}
      >
        {/* Animated Sweep Effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
            transform: 'skewX(-20deg)',
            animation: 'sweep 3s ease-in-out infinite'
          }}
        />

        {/* Outer Background Area */}
        <div className="chamfer-md p-4 sm:p-5 h-full flex flex-col relative bg-[var(--brawl-bg-card)]">

          <div className="flex-1 flex flex-col chamfer-sm p-[2px]" style={{ background: `linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)` }}>
            {/* Inner Content Area */}
            <div className="chamfer-sm py-6 px-6 flex flex-col items-center justify-center text-center flex-1 bg-[var(--brawl-bg-elevated)] relative overflow-hidden">

              {/* Radial Center Glow */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 50%, ${accentColor}, transparent 70%)` }}
              />

              {/* Title */}
              <h3 className="text-xs sm:text-sm font-bold text-[var(--brawl-text-muted)] tracking-[0.2em] uppercase whitespace-pre-line mb-3 relative z-10">
                {title}
              </h3>

              {/* Days Huge Display */}
              <div className="flex flex-col items-center justify-center relative z-10 my-2">
                <span
                  className="text-6xl sm:text-7xl font-display font-bold tracking-tighter drop-shadow-md"
                  style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}80` }}
                >
                  <CountUp end={days} disableGlow={disableGlow} suppressFirstPulse={suppressFirstPulse} />
                </span>
                <span
                  className="text-xl sm:text-2xl font-bold uppercase tracking-widest mt-1 opacity-80"
                  style={{ color: accentColor }}
                >
                  days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
