"use client";

import { useTransition } from "react";
import { setAdminThemeAction } from "@/app/admin/theme-actions";

export function ThemeToggle({ theme }: { theme: "dark" | "light" }) {
  const [pending, startTransition] = useTransition();

  function flip() {
    const next = theme === "dark" ? "light" : "dark";
    // Optimistically apply on the client so the UI updates instantly,
    // then persist via server action so SSR renders match on next nav.
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-admin-theme", next);
    }
    startTransition(() => setAdminThemeAction(next));
  }

  return (
    <button
      type="button"
      onClick={flip}
      disabled={pending}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle transition-colors hover:text-admin-text disabled:opacity-50"
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
