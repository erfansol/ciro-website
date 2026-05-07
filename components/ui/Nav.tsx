"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/cn";

/**
 * Marketing nav. Brand mark on the left, a Stories link plus a
 * sun/moon theme toggle on the right. The toggle picks dark or light;
 * the default is set by [InitialThemeScript] based on local time.
 *
 * On scroll a hairline border + blur fade in so the bar stays legible
 * over both palettes (white over light, blackish over dark).
 */
export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The admin dashboard has its own chrome; hide the marketing nav there.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-ink-900/[0.07] bg-white/65 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#06070d]/55"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
      >
        <Logo />
        <div className="flex items-center gap-5">
          <Link
            href="/stories"
            className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink-900/65 transition-colors hover:text-ink-900 dark:text-white/55 dark:hover:text-white"
          >
            Stories
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
