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
 * Single brand balloon, drawn flat: solid body, one darker gore, rope
 * and basket. Pure SVG so it's tiny, scales
 * crisply, and animates well via Framer / CSS transforms.
 */
export function Balloon({
  color,
  size = 240,
  className,
  ariaLabel,
}: Props) {
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
      {/* Flat body: one solid colour, a darker centre gore and a paper
          seam, drawn like the balloons in the Ciro films. No gradients. */}
      <path
        d="M100 5 C150 5 184 45 184 100 C184 150 146 180 118 205 L82 205 C54 180 16 150 16 100 C16 45 50 5 100 5 Z"
        fill={color}
      />
      <path
        d="M100 5 C126 40 124 150 110 205 L90 205 C76 150 74 40 100 5 Z"
        fill="#000000"
        opacity="0.16"
      />
      <path
        d="M22 112 C70 124 130 124 178 112"
        stroke="#faf7f0"
        strokeOpacity="0.4"
        strokeWidth="3"
        fill="none"
      />

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
