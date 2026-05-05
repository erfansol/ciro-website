import type { CategoryIconKey } from "@/lib/categories";

type Props = {
  color: string;
  iconKey: CategoryIconKey;
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
  iconKey,
  size = 240,
  className,
  ariaLabel,
}: Props) {
  const id = `b-${iconKey}-${color.replace("#", "")}`;
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

      {/* Icon centered on the balloon body */}
      <g transform="translate(70, 78)" fill="#ffffff" opacity="0.95">
        <Icon iconKey={iconKey} />
      </g>

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

function Icon({ iconKey }: { iconKey: CategoryIconKey }) {
  // Each icon is drawn in a 60x60 box so it sits centered when the
  // parent <g> is translated to (70, 78).
  switch (iconKey) {
    case "temple":
      return (
        <g>
          <rect x="6" y="46" width="48" height="6" rx="1" />
          <rect x="2" y="44" width="56" height="3" rx="1" />
          <rect x="10" y="20" width="6" height="26" />
          <rect x="22" y="20" width="6" height="26" />
          <rect x="34" y="20" width="6" height="26" />
          <rect x="46" y="20" width="6" height="26" />
          <path d="M2 20 L30 6 L58 20 Z" />
        </g>
      );
    case "eye":
      return (
        <g>
          <path
            d="M2 30 C12 12, 48 12, 58 30 C48 48, 12 48, 2 30 Z"
            stroke="#ffffff"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="30" cy="30" r="9" />
        </g>
      );
    case "controller":
      return (
        <g>
          <path
            d="M14 18 H46 C54 18, 60 24, 60 32 C60 40, 54 46, 46 46 H42 L36 40 H24 L18 46 H14 C6 46, 0 40, 0 32 C0 24, 6 18, 14 18 Z"
          />
          <circle cx="14" cy="32" r="3" fill="#1b1f2c" />
          <circle cx="46" cy="32" r="3" fill="#1b1f2c" />
          <rect x="9" y="28" width="10" height="2" rx="1" fill="#1b1f2c" />
          <rect x="13" y="24" width="2" height="10" rx="1" fill="#1b1f2c" />
        </g>
      );
    case "clapper":
      return (
        <g>
          <rect x="2" y="22" width="56" height="32" rx="3" />
          <path
            d="M2 22 L14 8 L24 22 Z M22 22 L34 8 L44 22 Z M42 22 L54 8 L60 22 Z"
            fill="#1b1f2c"
          />
        </g>
      );
    case "heart":
      return (
        <path d="M30 54 C8 40, 0 28, 0 18 C0 10, 6 4, 14 4 C20 4, 26 8, 30 14 C34 8, 40 4, 46 4 C54 4, 60 10, 60 18 C60 28, 52 40, 30 54 Z" />
      );
  }
}
