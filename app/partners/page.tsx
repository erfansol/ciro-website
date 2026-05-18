import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Partners & business · Ciro for cities, museums and travel",
  description:
    "Ciro is a software company. We sell a consumer subscription, licence the same engine to museums and cities, and let other apps embed it. Headquartered in Rome.",
  path: "/partners",
});

const layers = [
  {
    tag: "Consumer",
    title: "Mobile app — free, with a paid tier",
    detail:
      "A free tier with daily limits, and Ciro Plus at €6.99 / month or €49 / year for unlimited stories and offline downloads. Single-story unlocks are also planned. iOS live today; Android in beta.",
  },
  {
    tag: "Licensing",
    title: "Engine for museums, sites and cities",
    detail:
      "Museums, heritage sites and city operators licence the same engine to publish their own places — multilingual voice, written stories, optional AR. Annual licence, multi-year terms.",
  },
  {
    tag: "Distribution",
    title: "Embedded inside other apps",
    detail:
      "Travel apps, hotel concierge tools and in-car systems can embed Ciro through an SDK so their users get the same place-aware stories without leaving the host app.",
  },
];

const segments = [
  {
    title: "Cities & tourism boards",
    body:
      "Operator-curated story routes per neighbourhood, in the languages your visitors actually speak. A measurable layer on top of plaques and printed guides.",
    cta: "Partner as a city",
  },
  {
    title: "Museums & heritage sites",
    body:
      "Publish your collection or outdoor site as a Ciro portfolio — written, voiced and (optionally) AR-anchored. White-label is available.",
    cta: "License the engine",
  },
  {
    title: "Travel apps & in-car",
    body:
      "Embed Ciro inside an existing travel, booking or in-car app via SDK. Revenue share on subscriptions and individual story purchases.",
    cta: "Embed the SDK",
  },
  {
    title: "Schools & education",
    body:
      "Field-trip and classroom programmes that use real streets as the curriculum. Programme-level pricing for schools and universities.",
    cta: "Bring Ciro to your school",
  },
  {
    title: "Writers & local historians",
    body:
      "Local writers, historians and guides can publish their own story packs through Ciro and earn a share on every sale.",
    cta: "Apply as a contributor",
  },
];

const unitTargets = [
  { k: "Consumer pricing", v: "€6.99 / month or €49 / year" },
  { k: "Free tier", v: "Daily story quota; first three Rome stories free" },
  { k: "Licensing model", v: "Annual licence, per portfolio, multi-year terms" },
  { k: "First commercial market", v: "Italy (Rome, then north and south)" },
];

export default function PartnersPage() {
  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
          Partners &amp; business
        </p>
        <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
          Three ways the business is paid.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65">
          Ciro is a software company. We sell a consumer subscription, we
          license the same engine to museums and cities, and we let other
          apps embed it. The product is one piece of software; the
          customers are three.
        </p>

        {/* Three layers */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            How the business is paid
          </h2>
          <ol className="mt-8 space-y-4">
            {layers.map((l) => (
              <li
                key={l.tag}
                className="rounded-2xl border border-ink-900/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02] sm:p-8"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
                  {l.tag}
                </p>
                <h3 className="mt-3 font-display text-xl tracking-tight sm:text-2xl">
                  {l.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-900/70 dark:text-white/65">
                  {l.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Partner segments */}
        <section className="mt-20">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Who we partner with
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {segments.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-ink-900/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <h3 className="font-display text-lg tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-900/70 dark:text-white/65">
                  {s.body}
                </p>
                <p className="mt-4">
                  <a
                    href="mailto:info@ciroai.com?subject=Ciro%20partnership"
                    className="text-xs font-medium uppercase tracking-[0.18em] text-ink-900/70 underline-offset-4 hover:text-ink-900 hover:underline dark:text-white/70 dark:hover:text-white"
                  >
                    {s.cta} →
                  </a>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing snapshot */}
        <section className="mt-20">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Pricing &amp; model, today
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            Current published terms. Detailed financials and forward
            targets are shared under NDA with serious investors.
          </p>
          <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {unitTargets.map((t) => (
              <div
                key={t.k}
                className="border-b border-ink-900/8 pb-4 dark:border-white/8"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-900/45 dark:text-white/40">
                  {t.k}
                </dt>
                <dd className="mt-1 text-sm text-ink-900/85 dark:text-white/85">
                  {t.v}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section className="mt-20 rounded-2xl border border-ink-900/10 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02] sm:p-12">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Talk to us
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            Investor materials, financials, technical detail and product
            roadmap are shared under NDA. Write a short email — we reply
            in person.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:info@ciroai.com?subject=Ciro%20partnership"
              className="inline-flex items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-900/90 dark:bg-white dark:text-[#06070d] dark:hover:bg-white/90"
            >
              info@ciroai.com
            </a>
            <a
              href="mailto:erfan@ciroai.com"
              className="inline-flex items-center justify-center rounded-full border border-ink-900/15 bg-white/60 px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-white dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              erfan@ciroai.com · founder
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
