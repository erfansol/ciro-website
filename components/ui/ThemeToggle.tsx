"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Sun / moon button that flips the theme. Mirrors the rest of the nav
 * (small, monochrome, no labels) and is accessible — the live `aria-label`
 * tells the user what the next state is, not the current one.
 *
 * Until the component has mounted on the client we render a fixed-size
 * placeholder so the nav layout doesn't shift when the real toggle
 * appears. (`useTheme()` returns `undefined` on the server.)
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        aria-hidden
        className={`inline-flex h-8 w-8 ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-900/10 text-ink-900/70 transition-colors hover:bg-ink-900/[0.04] hover:text-ink-900 dark:border-white/15 dark:text-white/65 dark:hover:bg-white/[0.06] dark:hover:text-white ${className}`}
    >
      {isDark ? (
        // Sun
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
