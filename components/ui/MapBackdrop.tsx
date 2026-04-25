import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  variant?: "hero" | "section";
};

export function MapBackdrop({ className, variant = "section" }: Props) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18] dark:opacity-25"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="mb-fade" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <pattern id="mb-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0H0V44" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
          <mask id="mb-mask">
            <rect width="1200" height="800" fill="url(#mb-fade)" />
          </mask>
        </defs>
        <g className="text-brand-500 dark:text-brand-400" mask="url(#mb-mask)">
          <rect width="1200" height="800" fill="url(#mb-grid)" />
        </g>
        {variant === "hero" && (
          <g className="text-brand-400/70" mask="url(#mb-mask)">
            <path
              d="M150 600 Q 300 540 420 580 T 720 520 Q 880 470 1050 540"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 6"
            />
            <path
              d="M100 300 Q 280 220 460 280 T 800 250"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 6"
              opacity="0.6"
            />
            <circle cx="420" cy="580" r="6" fill="currentColor" />
            <circle cx="720" cy="520" r="6" fill="currentColor" />
            <circle cx="460" cy="280" r="6" fill="currentColor" />
          </g>
        )}
      </svg>
    </div>
  );
}
