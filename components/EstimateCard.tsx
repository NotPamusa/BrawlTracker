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
}: EstimateCardProps) {
  return (
    <div
      className="group cursor-default transition-all duration-300 hover:translate-y-[-2px] h-full"
      style={{
        filter: `drop-shadow(0 2px 8px rgba(0,0,0,0.3))`,
      }}
    >
      {/* Outer border — chamfered, accent color */}
      <div
        className="chamfer-md p-[3px] h-full flex flex-col"
        style={{
          background: `linear-gradient(
            160deg,
            ${borderColor} 0%,
            ${borderColorDim} 40%,
            ${borderColorDim} 60%,
            ${borderColor} 100%
          )`,
        }}
      >
        {/* Middle layer — card bg */}
        <div
          className="chamfer-md p-3 sm:p-4 h-full flex flex-col"
          style={{ background: bgOuter }}
        >
          {/* Inner content area */}
          <div
            className="chamfer-sm py-6 sm:py-7 px-5 flex flex-col items-center text-center flex-1"
            style={{ background: bgInner }}
          >
            {/* Title */}
            <h3 className="text-sm sm:text-base font-bold text-[var(--brawl-text)] leading-snug whitespace-pre-line mb-3">
              {title}
            </h3>

            {/* Days — big, bold, colored */}
            <div className="flex flex-col items-center">
              <span
                className="text-4xl sm:text-5xl font-display font-bold tracking-tight"
                style={{ color: accentColor }}
              >
                {days}
              </span>
              <span
                className="text-lg sm:text-xl font-display font-bold -mt-1"
                style={{ color: accentColor }}
              >
                days
              </span>
            </div>

            {/* Icon area */}
            <div className="flex items-center gap-2 mt-3">
              {icon}
            </div>

            {subtitle && (
              <p className="text-xs text-[var(--brawl-text-dim)] mt-2">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
