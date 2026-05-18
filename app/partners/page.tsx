import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Partners & business model · Ciro for cities, museums and creators",
  description:
    "Ciro is a digital-native, three-layer SaaS platform: B2C freemium app, B2B Story Atlas licensing for museums and cities, and B2B2C distribution through OTAs, hotels and an embeddable SDK. Headquartered in Rome.",
  path: "/partners",
});

const layers = [
  {
    tag: "B2C",
    title: "Consumer app — freemium",
    detail:
      "Free tier with limits, plus Ciro Plus at €6.99 / month or €49 / year and à-la-carte story packs. Target B2C ARPU €38 / year, gross margin ~75%. Live on iOS; Android beta in test flight.",
  },
  {
    tag: "B2B",
    title: "Story Atlas licensing for museums, sites and cities",
    detail:
      "Heritage institutions and cultural foundations license the Story Atlas for their portfolios — typical ACV €25K–€250K / year, multi-year, ~90% gross margin. Includes white-label deployments and branded AR routes.",
  },
  {
    tag: "B2B2C",
    title: "Distribution — OTAs, hotels, in-car, smart-glasses",
    detail:
      "Co-branded story routes with cities and tourism boards, hotel concierge bundles, and an embeddable SDK for OTAs and travel super-apps. The same Story Atlas, surfaced where travellers already are.",
  },
];

const segments = [
  {
    title: "Cities & tourism boards",
    body:
      "Co-branded city-wide story routes that work in any language. Replace static plaques and PDF guides with a living, measurable storytelling layer.",
    cta: "Partner as a city",
  },
  {
    title: "Museums & heritage sites",
    body:
      "Story Atlas portfolios for permanent collections, temporary exhibitions, and outdoor archaeological sites. Voice + AR + chat in 30+ languages from a single licence.",
    cta: "Licence the Story Atlas",
  },
  {
    title: "OTAs & travel super-apps",
    body:
      "Embed the Ciro SDK inside Booking, Expedia-class apps, airline apps, and in-car infotainment. Revenue share on Plus subscriptions and story packs.",
    cta: "Embed the SDK",
  },
  {
    title: "Schools & EdTech",
    body:
      "Field-trip and classroom programmes that turn cities into a curriculum. Bundle pricing for school districts and university programmes.",
    cta: "Bring Ciro to your school",
  },
  {
    title: "Creators & storytellers",
    body:
      "Writers, historians, and travel creators publish their own story packs through the Ciro creator programme and earn a revenue share on every sale.",
    cta: "Apply as a creator",
  },
  {
    title: "EU & public grants",
    body:
      "Ciro stacks public funding (CR.EU.IN. Heritage, Horizon, Italian PNI / Startcup Lazio) against the same product roadmap — non-dilutive capital aligned to a digital-native model.",
    cta: "Co-apply for grants",
  },
];

const unitTargets = [
  { k: "B2C ARPU target", v: "€38 / user / year" },
  { k: "B2C gross margin", v: "~75%" },
  { k: "B2B ACV target", v: "€60K average" },
  { k: "B2B gross margin", v: "~90%" },
  { k: "Round target end-of-seed MAU", v: "250K across 6 Italian cities" },
  { k: "Round target end-of-seed ARR", v: "€1.5M (B2C + first B2B contracts)" },
];

export default function PartnersPage() {
  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
          For partners
        </p>
        <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
          A three-layer, digital-native business.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65">
          Ciro is a software platform, not a tour-operator. We monetize across
          three reinforcing layers — consumer subscriptions, B2B licensing of
          the Story Atlas to cultural institutions, and B2B2C distribution
          through OTAs, hotels and an embeddable SDK. Everything compounds on
          the same software backbone.
        </p>

        {/* Three layers */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            The three layers
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

        {/* Unit targets */}
        <section className="mt-20">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Unit economics &amp; round targets
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            Working targets from the 2026 seed plan. Updated as contracts
            close.
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
            Investor decks, financial model, technical architecture, and the
            seed-round data room are available on request.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:info@ciroai.com?subject=Ciro%20partnership"
              className="inline-flex items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-900/90 dark:bg-white dark:text-[#06070d] dark:hover:bg-white/90"
            >
              info@ciroai.com
            </a>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-ink-900/15 bg-white/60 px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-white dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              About the company
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
