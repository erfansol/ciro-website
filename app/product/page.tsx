import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "The Ciro app · How it works",
  description:
    "Ciro is a mobile app that plays a short story about the place you're standing in — by voice, by text chat, and optionally with an AR overlay. Live on iOS, validated in Rome and 14 other countries.",
  path: "/product",
});

const steps = [
  {
    n: "01",
    title: "Open the app",
    body:
      "The home screen shows a brief about today and a list of stories near you, sorted by distance.",
  },
  {
    n: "02",
    title: "Pick a place",
    body:
      "The map shows nearby story points. Each one is tied to a real building, square or street.",
  },
  {
    n: "03",
    title: "Listen, read, or look",
    body:
      "Each story has a written piece, narrated voice, and — where available — an AR overlay anchored to the building in front of you.",
  },
  {
    n: "04",
    title: "Walk to the next",
    body:
      "Stories chain into a route. Progress is saved per city; you can leave and pick it up later.",
  },
];

const shots = [
  {
    file: "home_today.jpg",
    title: "Home · Around you",
    body:
      "Stories sorted by distance. A daily brief surfaces what's most interesting nearby today.",
  },
  {
    file: "explore_map_light.jpg",
    title: "Explore · Map of stories",
    body:
      "Every story is pinned to a real coordinate. Tap a pin to read the lead and start.",
  },
  {
    file: "stories_library.jpg",
    title: "Stories · Library",
    body:
      "Filter by category and city. Stories are short — typically three to ten minutes of walking.",
  },
  {
    file: "story_detail.jpg",
    title: "Story · Detail",
    body:
      "A single piece of writing per place. Mood tags, length and walking distance up front.",
  },
  {
    file: "personalization.jpg",
    title: "Settings · Personalization",
    body:
      "Three switches that shape the generation: experience style, content focus, and time depth.",
  },
  {
    file: "profile_light.jpg",
    title: "Profile · Progress",
    body:
      "Cities visited, steps walked, stories finished. Progress is per-city, not global.",
  },
];

const stack = [
  { k: "Mobile app", v: "Flutter — production iOS build shipped" },
  { k: "AR engine", v: "Unity + ARCore Geospatial / ARKit Location Anchors" },
  { k: "AI engine", v: "Google Gemini, with location- and profile-aware prompting" },
  { k: "Backend", v: "Firebase on Google Cloud (Auth, Firestore, Storage, Functions)" },
  { k: "Web", v: "Next.js 15 on Node, deployed at ciroai.com" },
  { k: "Field validation", v: "Rome and 14 other countries; ~95% positional accuracy" },
];

const useCases = [
  "Cultural tourism — short walking stories at street level",
  "Heritage sites & museums — branded, multilingual storytelling layers",
  "Education — school field trips and university programmes",
  "City marketing — operator-curated story routes per neighbourhood",
];

export default function ProductPage() {
  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
          The app
        </p>
        <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
          A short story about the place you&rsquo;re in.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65">
          Ciro is a mobile app. Open it on a street in Rome and it plays a
          three-to-ten-minute story tied to that exact spot — read it, listen
          to it, or look at it through an AR overlay on the building in
          front of you. Live on iOS today; Android beta is in test flight.
        </p>

        {/* In-app gallery */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Inside the app
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            Screens from the current iOS production build.
          </p>
          <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {shots.map((s) => (
              <li key={s.file} className="space-y-4">
                <div className="relative mx-auto aspect-[9/19.5] w-full max-w-[280px] overflow-hidden rounded-[28px] border border-ink-900/10 bg-ink-900/5 dark:border-white/10 dark:bg-white/[0.02]">
                  <Image
                    src={`/app/${s.file}`}
                    alt={`Ciro app — ${s.title}`}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 40vw, 80vw"
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-900/55 dark:text-white/45">
                    {s.title}
                  </p>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-900/70 dark:text-white/60">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-24">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2">
            {steps.map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-ink-900/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/45 dark:text-white/40">
                  Step {s.n}
                </span>
                <h3 className="mt-3 font-display text-xl tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-900/70 dark:text-white/65">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Field test */}
        <section className="mt-24">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Tested in public
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            Public AR sessions at Maker Faire Rome 2024 (Gazometro). Around
            eight minutes of average engagement per visitor — the first
            evidence that the format holds attention in the wild.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-ink-900/10 bg-white dark:border-white/10 dark:bg-white/[0.02]"
              >
                <Image
                  src={`/product/ar_field_test_0${i}.png`}
                  alt={`Ciro AR field test at Maker Faire Rome 2024, frame ${i}`}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="mt-24">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            What it&rsquo;s built on
          </h2>
          <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {stack.map((s) => (
              <div
                key={s.k}
                className="border-b border-ink-900/8 pb-4 dark:border-white/8"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-900/45 dark:text-white/40">
                  {s.k}
                </dt>
                <dd className="mt-1 text-sm text-ink-900/85 dark:text-white/85">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Use cases */}
        <section className="mt-24">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Where it fits
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            The same engine serves four kinds of customer today.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {useCases.map((v) => (
              <li
                key={v}
                className="rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.02]"
              >
                {v}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="mt-24 rounded-2xl border border-ink-900/10 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02] sm:p-12">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Try it, or work with us
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            iOS production build is live; Android beta is in test flight.
            Cities, museums and education programmes can{" "}
            <Link href="/partners" className="underline-offset-4 hover:underline">
              partner with us
            </Link>
            .
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#waitlist"
              className="inline-flex items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-900/90 dark:bg-white dark:text-[#06070d] dark:hover:bg-white/90"
            >
              Join the waitlist
            </Link>
            <Link
              href="/partners"
              className="inline-flex items-center justify-center rounded-full border border-ink-900/15 bg-white/60 px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-white dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Partner with Ciro
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
