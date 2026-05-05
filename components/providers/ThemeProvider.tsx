"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * The redesigned site is dark-only by intent — the mystery aesthetic
 * (deep night, balloon glow, cursor trail) breaks under a light theme.
 * `forcedTheme="dark"` locks every page to the dark palette regardless
 * of OS preference, and the theme toggle has been removed from the nav.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="dark"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
