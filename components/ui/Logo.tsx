import Image from "next/image";
import Link from "next/link";

/**
 * Brand mark. Uses the new app icon (`/icon.png`) plus the CIRO wordmark
 * in display font. Reads correctly in both light and dark mode — the
 * icon is the same in either, but the wordmark color flips with the theme.
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
      <Image
        src="/icon.png"
        alt=""
        width={28}
        height={28}
        priority
        className="h-7 w-7 rounded-md"
      />
      <span className="font-display text-[15px] font-medium tracking-[0.22em] text-ink-900/85 transition-colors group-hover:text-ink-900 dark:text-white/85 dark:group-hover:text-white">
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
