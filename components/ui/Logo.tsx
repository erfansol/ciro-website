import Link from "next/link";

export function Logo({ className, asLink = true }: { className?: string; asLink?: boolean }) {
  const inner = (
    <span className={`group inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="relative h-9 w-9" aria-hidden>
        <svg viewBox="0 0 200 200" className="h-9 w-9 rounded-[10px]">
          <rect width="200" height="200" rx="44" fill="#FFD54F" />
          <path
            d="M 152 70 A 60 60 0 1 0 152 130"
            fill="none"
            stroke="white"
            strokeWidth="32"
            strokeLinecap="round"
          />
          <circle cx="158" cy="82" r="10" fill="white" />
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
