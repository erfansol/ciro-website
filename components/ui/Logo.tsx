import Link from "next/link";

export function Logo({ className, asLink = true }: { className?: string; asLink?: boolean }) {
  const inner = (
    <span className={`group inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="relative h-8 w-8" aria-hidden>
        <svg viewBox="0 0 32 32" className="h-8 w-8">
          <defs>
            <linearGradient id="ciro-logo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFD54F" />
              <stop offset="55%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="14" fill="url(#ciro-logo)" />
          <path
            d="M21.5 12.2c-1.1-1.4-2.7-2.2-4.5-2.2-3.4 0-6 2.6-6 6s2.6 6 6 6c1.8 0 3.5-.8 4.5-2.2"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      <span className="font-display text-lg tracking-tight text-ink-900 dark:text-white">
        Ciro
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
