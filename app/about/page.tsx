import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, SITE, founderJsonLd } from "@/lib/seo";
import { RECOGNITION_BY_DATE } from "@/lib/recognition";

export const metadata: Metadata = buildMetadata({
  title: "About Ciro · Company, founder and team",
  description:
    "Ciro is a Rome-based company building location-aware storytelling software for cities, museums and travellers. Founded in 2024 by Erfan Soleymanzadeh out of Sapienza Università di Roma.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(founderJsonLd()) }}
      />
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
          About
        </p>
        <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
          A Rome company building location-aware storytelling.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65">
          Ciro is an early-stage company headquartered in Rome. We make a
          mobile app and a back-end that, given where you are, plays a short
          story about that place — in your language, with the option of an
          AR overlay anchored to the real building in front of you. The
          company was founded in 2024 by Erfan Soleymanzadeh, building on
          his master&rsquo;s research at Sapienza Università di Roma.
        </p>

        {/* What we do */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            What we do
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-900/75 dark:text-white/70">
            Audio guides are linear, plaques are static, human guides are
            scarce. We think the most useful piece of software a traveller
            can carry is one that knows where they&rsquo;re standing and can
            tell them why it matters. That is the product we are building.
            The same engine licenses out to museums, cities and education
            programmes that want to publish their own places — a software
            layer rather than a one-off audio tour.
          </p>
        </section>

        {/* Founder */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Founder
          </h2>
          <div className="mt-6 rounded-2xl border border-ink-900/10 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02]">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-ink-900/45 dark:text-white/40">
              Founder &amp; CEO
            </p>
            <h3 className="mt-3 font-display text-2xl tracking-tight sm:text-3xl">
              Erfan Soleymanzadeh
            </h3>
            <p className="mt-1 text-sm text-ink-900/55 dark:text-white/55">
              Rome, Italy
            </p>
            <div className="mt-6 max-w-2xl">
              <p className="text-sm leading-relaxed text-ink-900/75 dark:text-white/70">
                Designer and engineer with more than a decade of work in XR,
                AR, mobile, and geospatial systems. M.Des. in Design, Visual
                &amp; Multimedia Communication from Sapienza Università di Roma
                (2024), where his thesis introduced the Ciro framework.
                Previous work includes geospatial social products (Vansurf,
                Vancouver), creative direction and VR labs (Wihan Studio,
                Tehran), and the Persian online encyclopedia Wikijoo (~70,000
                articles, ~500,000 monthly readers).
              </p>
              <p className="mt-4 text-xs text-ink-900/55 dark:text-white/50">
                Languages: Persian (native), English, Italian.
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm text-ink-900/60 dark:text-white/55">
            Investors and partners: please write to{" "}
            <a
              className="underline-offset-4 hover:underline"
              href="mailto:info@ciroai.com"
            >
              info@ciroai.com
            </a>
            . For a direct line to the founder,{" "}
            <a
              className="underline-offset-4 hover:underline"
              href="mailto:erfan@ciroai.com"
            >
              erfan@ciroai.com
            </a>
            .
          </p>
        </section>

        {/* Where we work */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Where we&rsquo;re based
          </h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <Fact term="Headquarters" detail="Rome, Italy" />
            <Fact term="Founded" detail="2024" />
            <Fact term="Stage" detail="Pre-seed → Seed" />
            <Fact term="Founder" detail="Erfan Soleymanzadeh" />
            <Fact term="Academic home" detail="Sapienza Università di Roma" />
            <Fact term="Live in" detail="Rome — Italy expansion next" />
          </dl>
        </section>

        {/* Recognition */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Recognition
          </h2>
          <p className="mt-3 text-sm text-ink-900/60 dark:text-white/55">
            Programmes and institutions that have selected Ciro to date.
          </p>
          <ul className="mt-6 space-y-3">
            {RECOGNITION_BY_DATE.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-4 border-b border-ink-900/8 pb-3 dark:border-white/8"
              >
                <div>
                  <p className="text-sm font-medium text-ink-900/90 dark:text-white/85">
                    {r.short}
                  </p>
                  <p className="text-xs text-ink-900/55 dark:text-white/45">
                    {r.issuer}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs uppercase tracking-[0.18em] text-ink-900/45 dark:text-white/40">
                  {r.date}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <Link
              href="/press"
              className="underline-offset-4 hover:underline"
            >
              See the full press &amp; recognition page →
            </Link>
          </p>
        </section>

        {/* Contact */}
        <section className="mt-16 rounded-2xl border border-ink-900/10 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02]">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Contact
          </h2>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <Fact term="Investors & business" detail="info@ciroai.com" />
            <Fact term="Founder, direct" detail="erfan@ciroai.com" />
            <Fact term="Headquarters" detail="Rome, Italy" />
            <Fact term="Web" detail={SITE.url.replace("https://", "")} />
          </dl>
        </section>
      </div>
    </div>
  );
}

function Fact({ term, detail }: { term: string; detail: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-900/45 dark:text-white/40">
        {term}
      </dt>
      <dd className="mt-1 text-sm text-ink-900/85 dark:text-white/85">
        {detail}
      </dd>
    </div>
  );
}
