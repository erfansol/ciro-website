import Link from "next/link";

/**
 * Minimal wordmark for the dark mystery palette: a small pulsing dot
 * (the brand yellow #FFD54F, kept as a single accent) plus the CIRO
 * wordmark in display font with wide tracking. Replaces the previous
 * yellow-square C-glyph that read as too loud against the new hero.
 */
export function Logo({
  className,
  asLink = true,
}: {
  className?: string;
  asLink?: boolean;
}) {
  const inner = (
    <span
      className={`group inline-flex items-center gap-2.5 ${className ?? ""}`}
    >
      <span className="relative inline-flex h-2 w-2" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-[#FFD54F]" />
        <span className="absolute inset-0 animate-ping rounded-full bg-[#FFD54F] opacity-60" />
      </span>
      <span className="font-display text-[15px] font-medium tracking-[0.22em] text-white/85 transition-colors group-hover:text-white">
        CIRO
      </span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href="/" aria-label="Ciro home">
      {inner}
    </Link>
  );
}
