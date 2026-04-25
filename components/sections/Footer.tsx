import Link from "next/link";
import { Logo } from "../ui/Logo";
import { CITIES } from "@/lib/cities";

const company = [
  { label: "About", href: "/#what" },
  { label: "Stories", href: "/stories" },
  { label: "Investors", href: "/#invest" },
  { label: "Press", href: "mailto:press@ciroai.com" },
];

const product = [
  { label: "How it works", href: "/#how" },
  { label: "Cities", href: "/#cities" },
  { label: "Waitlist", href: "/#waitlist" },
];

const legal = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Cookies", href: "/legal/cookies" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-ink-900/8 dark:border-white/5 bg-white/40 dark:bg-ink-950/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm text-sm text-ink-900/70 dark:text-white/60 leading-relaxed">
              Cities are not places. They are stories waiting to be experienced. Ciro is the AI travel companion turning every street into a chapter.
            </p>
            <p className="mt-6 text-xs text-ink-900/50 dark:text-white/40">
              A startup &amp; mobile app founded by{" "}
              <span className="font-medium text-ink-900/80 dark:text-white/70">
                Erfan Soleymanzadeh
              </span>
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

        <div className="mt-12 flex flex-col items-start gap-4 border-t border-ink-900/8 dark:border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="mailto:hello@ciroai.com"
            className="text-sm text-ink-900/70 hover:text-ink-900 dark:text-white/70 dark:hover:text-white"
          >
            hello@ciroai.com
          </a>
          <div className="flex items-center gap-3">
            <Social label="Twitter" href="https://twitter.com/ciro_travel" />
            <Social label="Instagram" href="https://instagram.com/ciro.travel" />
            <Social label="LinkedIn" href="https://linkedin.com/company/ciro-travel" />
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

function Social({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] text-ink-900/70 dark:text-white/70 hover:text-ink-900 dark:hover:text-white"
    >
      <span className="text-xs font-medium">{label[0]}</span>
    </a>
  );
}
