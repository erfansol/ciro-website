import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "How Ciro works · The Story Atlas",
  description:
    "Ciro detects where you stand, pulls a curated cultural corpus for that location, and generates a voice-narrated, AR-anchored story tuned to you — in any language. Built on Flutter, Firebase, Gemini, and Unity ARCore Geospatial.",
  path: "/product",
});

const steps = [
  {
    n: "01",
    title: "Detect where you stand",
    body:
      "GPS plus visual geospatial positioning (ARCore Geospatial / ARKit Location Anchors) pin Ciro to the real building you're looking at — sub-meter accuracy in 100+ countries.",
  },
  {
    n: "02",
    title: "Pull the cultural corpus",
    body:
      "Ciro retrieves a curated body of history, people, events, art, myth and conflict tied to that location from the Story Atlas, a proprietary cultural data graph.",
  },
  {
    n: "03",
    title: "Generate the story for you",
    body:
      "Generative AI composes an emotionally calibrated story (not a fact list) tuned to your interests, age, language, mood, time of day, and minutes available.",
  },
  {
    n: "04",
    title: "Deliver in three channels",
    body:
      "Voice narration, AR characters anchored to the real environment, and conversational chat that lets you ask the place questions — all coherent, all in your language.",
  },
];

const channels = [
  {
    label: "Voice",
    body: "Spotify-grade narration, picked to match your mood and the time of day.",
  },
  {
    label: "AR",
    body: "Characters and overlays anchored to the real building, not floating in mid-air.",
  },
  {
    label: "Chat",
    body: "Ask the place questions in plain language. Ciro answers from its curated corpus.",
  },
];

const stack = [
  { k: "Mobile app", v: "Flutter (Dart) — production iOS build shipped" },
  { k: "AR engine", v: "Unity + ARCore Geospatial / ARKit Location Anchors" },
  { k: "AI engine", v: "Google Gemini, context-aware retrieval pipeline" },
  { k: "Backend", v: "Firebase (Auth, Firestore, Storage, Functions, Hosting) on Google Cloud" },
  { k: "Web", v: "Next.js 15 + Tailwind, ISR + Firebase Admin SDK" },
  { k: "Geo coverage", v: "Validated in 15 countries at ~95% geospatial accuracy" },
];

const verticals = [
  "Travel & cultural tourism",
  "Cultural heritage & museums",
  "Education (EdTech, school field trips)",
  "Gaming (location-based narrative)",
  "Health & wellbeing (mindful urban walks)",
  "Creator economy (paid story packs)",
];

export default function ProductPage() {
  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
          Product
        </p>
        <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
          The Story Atlas, on the spot, in any language.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65">
          Open Ciro at any street, square, or monument. Ciro figures out where
          you are, pulls a curated cultural corpus for that location, and plays
          a short, real story made for you — by voice, in chat, and in AR.
        </p>

        {/* How it works */}
        <section className="mt-16">
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

        {/* Three channels */}
        <section className="mt-20">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Three channels, one story
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            Ciro is not an audio guide. It is a conversation between the
            traveller and a city&rsquo;s memory.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {channels.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border border-ink-900/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
                  {c.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/75 dark:text-white/70">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* AR field-test gallery */}
        <section className="mt-20">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Live in the field
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            Public AR field tests at Maker Faire Rome 2024 (Gazometro).
            Hundreds of visitors, ~8 minutes of average engagement per
            session.
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
        <section className="mt-20">
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

        {/* Verticals */}
        <section className="mt-20">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            One platform, six verticals
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            The same Story Atlas powers more than tourism. Each vertical pulls
            on the same engine with a different content corpus and tone.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {verticals.map((v) => (
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
        <section className="mt-20 rounded-2xl border border-ink-900/10 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02] sm:p-12">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Try Ciro
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-900/65 dark:text-white/60">
            The iOS production build is live; Android beta is in test flight.
            Cities, museums, and creators can also{" "}
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
