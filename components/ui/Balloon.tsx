import type { CategoryIconKey } from "@/lib/categories";

type Props = {
  color: string;
  /** Kept for callsite compatibility — no longer rendered. */
  iconKey?: CategoryIconKey;
  /** Pixel size of the rendered balloon. The SVG scales proportionally. */
  size?: number;
  /** Optional extra Tailwind classes (e.g. for filter / blur). */
  className?: string;
  ariaLabel?: string;
};

/**
 * Single brand balloon: smooth body, paneled gores, rope, basket, and
 * a category icon centered on the body. Pure SVG so it's tiny, scales
 * crisply, and animates well via Framer / CSS transforms.
 */
export function Balloon({
  color,
  size = 240,
  className,
  ariaLabel,
}: Props) {
  const id = `b-${color.replace("#", "")}`;
  return (
    <svg
      width={size}
      height={size * 1.45}
      viewBox="0 0 200 290"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <radialGradient
          id={`${id}-shade`}
          cx="35%"
          cy="32%"
          r="75%"
          fx="32%"
          fy="28%"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </radialGradient>
        <linearGradient id={`${id}-gore`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.0" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Balloon body */}
      <ellipse cx="100" cy="105" rx="84" ry="100" fill={`url(#${id}-shade)`} />

      {/* Vertical gore lines for the paneled look */}
      <g opacity="0.55">
        <path
          d="M100 5 C100 80, 100 150, 100 205"
          stroke={`url(#${id}-gore)`}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M62 12 C50 80, 50 140, 70 200"
          stroke={`url(#${id}-gore)`}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M138 12 C150 80, 150 140, 130 200"
          stroke={`url(#${id}-gore)`}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M30 50 C25 110, 35 160, 55 198"
          stroke={`url(#${id}-gore)`}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M170 50 C175 110, 165 160, 145 198"
          stroke={`url(#${id}-gore)`}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      {/* Burner cone */}
      <path
        d="M82 198 L118 198 L112 224 L88 224 Z"
        fill="#1b1f2c"
        opacity="0.75"
      />

      {/* Ropes */}
      <line x1="86" y1="222" x2="76" y2="252" stroke="#0f1320" strokeWidth="1.4" />
      <line x1="114" y1="222" x2="124" y2="252" stroke="#0f1320" strokeWidth="1.4" />
      <line x1="100" y1="222" x2="100" y2="252" stroke="#0f1320" strokeWidth="1.2" opacity="0.7" />

      {/* Basket */}
      <rect
        x="72"
        y="252"
        width="56"
        height="28"
        rx="3"
        fill="#6b4a2b"
      />
      <rect
        x="72"
        y="252"
        width="56"
        height="28"
        rx="3"
        fill="url(#weave)"
        opacity="0.4"
      />

      <defs>
        <pattern
          id="weave"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 3 L6 3" stroke="#3a2615" strokeWidth="0.8" />
          <path d="M3 0 L3 6" stroke="#3a2615" strokeWidth="0.8" />
        </pattern>
      </defs>
    </svg>
  );
}
