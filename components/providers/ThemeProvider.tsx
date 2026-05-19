"use client";

import type { ReactNode } from "react";

/**
 * The public marketing site is light-mode only. This file used to host
 * a next-themes-driven light/dark toggle; we removed the toggle and the
 * provider in favour of a single, calmer palette.
 *
 * Kept as a no-op wrapper so existing imports (`<ThemeProvider>` in
 * [app/layout.tsx]) continue to compile without an audit of every
 * import site.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Inline `<script>` that runs before hydration. With dark mode removed
 * the only thing this script does is pin the document to light, both
 * to override any stale `dark` class a returning visitor may have in
 * their browser's HTML cache and to set `color-scheme` so form controls
 * render light.
 */
export const InitialThemeScript = () => {
  const code = `
(function () {
  try {
    var root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
    localStorage.removeItem('ciro-theme');
  } catch (_) {}
})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
};
