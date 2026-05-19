"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";

/**
 * Marketing nav. Brand mark on the left, primary section links on the
 * right. A soft white backdrop + blur is applied from the first pixel
 * (not only on scroll) so the headline below never reads through the
 * nav and overlap stops happening on wide viewports.
 */
const links = [
  { href: "/product", label: "Product" },
  { href: "/stories", label: "Stories" },
  { href: "/partners", label: "Partners" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press" },
];

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
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        "bg-white/80 backdrop-blur-xl",
        scrolled
          ? "border-b border-ink-900/[0.08] shadow-[0_1px_0_rgba(15,23,42,0.04)]"
          : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
      >
        <Logo />
        <div className="flex items-center gap-5 sm:gap-7">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hidden text-[11px] font-medium uppercase tracking-[0.28em] transition-colors sm:inline",
                pathname === item.href
                  ? "text-ink-900"
                  : "text-ink-900/55 hover:text-ink-900",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/about"
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-900/65 transition-colors hover:text-ink-900 sm:hidden"
          >
            Menu
          </Link>
        </div>
      </nav>
    </header>
  );
}
