"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../ui/Logo";
import { CITIES } from "@/lib/cities";

const company = [
  { label: "About", href: "/about" },
  { label: "Press", href: "/press" },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "mailto:hello@ciroai.com" },
];

const product = [
  { label: "How it works", href: "/product" },
  { label: "Stories", href: "/stories" },
  { label: "Waitlist", href: "/#waitlist" },
  { label: "iOS", href: process.env.NEXT_PUBLIC_IOS_URL ?? "#" },
  { label: "Android", href: process.env.NEXT_PUBLIC_ANDROID_URL ?? "#" },
];

const legal = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Cookies", href: "/legal/cookies" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="relative border-t border-ink-900/8 dark:border-white/5 bg-white/40 dark:bg-ink-950/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm text-sm text-ink-900/70 dark:text-white/60 leading-relaxed">
              Ciro turns every place into a short, real story you can walk through — by voice, in chat, and in AR. Open the app at any street and Ciro tells you what happened there, in your language.
            </p>
            <p className="mt-6 text-xs text-ink-900/55 dark:text-white/45">
              Headquartered in <span className="text-ink-900/80 dark:text-white/70">Rome, Italy</span>.
              Founded in 2024 by{" "}
              <Link
                href="/about"
                className="font-medium text-ink-900/80 underline-offset-4 hover:underline dark:text-white/70"
              >
                Erfan Soleymanzadeh
              </Link>
              .
            </p>
            <p className="mt-2 text-xs text-ink-900/50 dark:text-white/40">
              © {new Date().getFullYear()} Erfan Soleymanzadeh · Ciro™. All rights reserved.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterCol title="Company" items={company} />
            <FooterCol title="Product" items={product} />
            <FooterCol
              title="Cities"
              items={CITIES.map((c) => ({ label: c.name, href: `/city/${c.slug}` }))}
            />
            <FooterCol title="Legal" items={legal} />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 border-t border-ink-900/8 dark:border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-sm">
            <a
              href="mailto:hello@ciroai.com"
              className="text-ink-900/80 hover:text-ink-900 dark:text-white/75 dark:hover:text-white"
            >
              hello@ciroai.com
            </a>
            <a
              href="mailto:press@ciroai.com"
              className="text-ink-900/60 hover:text-ink-900 dark:text-white/55 dark:hover:text-white"
            >
              press@ciroai.com
            </a>
            <a
              href="mailto:info@ciroai.com"
              className="text-ink-900/60 hover:text-ink-900 dark:text-white/55 dark:hover:text-white"
            >
              info@ciroai.com · investors & partners
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-900/60 dark:text-white/40">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="text-sm text-ink-900/80 hover:text-ink-900 dark:text-white/70 dark:hover:text-white"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

