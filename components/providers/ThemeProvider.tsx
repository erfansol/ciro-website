"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Time-of-day theming. The site defaults to **light during local
 * daytime (07:00–19:00)** and **dark during night**. The user can flip
 * either way with the nav toggle; the choice is remembered in
 * localStorage and used on every subsequent visit.
 *
 * Implementation: we let `next-themes` own the toggle + persistence
 * (`attribute="class"`, `storageKey`), and pre-seed `defaultTheme` from
 * a tiny boot script that runs before hydration. The script is rendered
 * inline by [InitialThemeScript] in [app/layout.tsx] so the document
 * loads with the correct class — no flash of the wrong theme.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={false}
      storageKey="ciro-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Inline `<script>` that runs *before* hydration, looks at any saved
 * preference, and otherwise picks light or dark based on local time.
 * Sets the right class on `<html>` so the first paint has the correct
 * palette and there is no flash of dark on a daytime visit.
 */
export const InitialThemeScript = () => {
  const code = `
(function () {
  try {
    var saved = localStorage.getItem('ciro-theme');
    var theme;
    if (saved === 'light' || saved === 'dark') {
      theme = saved;
    } else {
      var hour = new Date().getHours();
      // Daytime: 7am to 7pm local. Anything else is night.
      theme = (hour >= 7 && hour < 19) ? 'light' : 'dark';
    }
    var root = document.documentElement;
    root.classList.remove('light','dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (_) {}
})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
};
