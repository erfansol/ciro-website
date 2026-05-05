"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";

/**
 * Minimal nav for the mystery landing. Brand mark on the left, a single
 * "Stories" link on the right. No theme toggle (the site is dark-only)
 * and no waitlist button (the waitlist already lives at the bottom of
 * the page, reachable via the Begin scroll cue and the finale).
 *
 * On scroll, a barely-visible blur and hairline border fade in so the
 * nav stays legible over white sections (story / city pages) without
 * disturbing the hero.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/[0.06] bg-[#06070d]/55 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
      >
        <Logo />
        <Link
          href="/stories"
          className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/55 transition-colors hover:text-white"
        >
          Stories
        </Link>
      </nav>
    </header>
  );
}
