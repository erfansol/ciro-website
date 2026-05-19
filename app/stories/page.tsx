import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { CATEGORIES, loadStories, type Story } from "@/lib/stories";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Stories that turn streets into chapters",
  description:
    "Live, location-based stories from Rome. Each story is short, walkable, and tied to a single real place.",
  path: "/stories",
});

export default async function StoriesPage() {
  const stories = await loadStories();
  const grouped = groupByCategory(stories);

  return (
    <main className="bg-white text-ink-900">
      <header className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, #fff8e7 0%, #ffffff 70%, #ffffff 100%)",
          }}
        />
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-900/45">
            The Library
          </p>
          <h1 className="mt-6 font-display text-balance text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[1.05] tracking-tight">
            Streets that won&rsquo;t stay quiet.
          </h1>
        </div>

        <div className="mx-auto mt-12 max-w-3xl px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-ink-900/10 bg-white px-6 py-4 text-center text-sm text-ink-900/70 sm:flex-row sm:justify-center sm:gap-3">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-900/55">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-amber-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
              </span>
              In progress
            </span>
            <span>
              First set of stories below. New cards every week — full Rome
              this summer, Italy next.
            </span>
          </div>
        </div>
      </header>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {CATEGORIES.map((cat) => {
            const items = grouped[cat.id] ?? [];
            if (items.length === 0) return null;
            return (
              <div key={cat.id} className="mb-20">
                <div className="mb-8 flex items-baseline justify-between">
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.32em]"
                      style={{ color: cat.color }}
                    >
                      {cat.label}
                    </p>
                    <h2 className="mt-2 font-display text-2xl tracking-tight text-ink-900 sm:text-3xl">
                      {cat.tagline}
                    </h2>
                  </div>
                  <span className="text-xs uppercase tracking-[0.28em] text-ink-900/35">
                    {items.length} {items.length === 1 ? "story" : "stories"}
                  </span>
                </div>

                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((story, i) => (
                    <Reveal key={story.id} as="li" delay={(i % 3) * 0.06}>
                      <StoryCard story={story} />
                    </Reveal>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/stories/${story.id}`} className="block h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-900/10 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-900/25 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div
          className="relative h-44"
          style={{
            background: `linear-gradient(135deg, ${story.meta.color} 0%, ${story.meta.color}aa 50%, #ffffff 100%)`,
          }}
        >
          <div className="absolute right-4 top-4 flex gap-2">
            {story.hasAr && <Badge tone="ar">AR</Badge>}
            {story.durationLabel && (
              <Badge tone="neutral">{story.durationLabel}</Badge>
            )}
          </div>
          <div className="absolute bottom-4 left-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/95">
              {story.city}
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl tracking-tight text-ink-900">
            {story.title}
          </h3>
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-900/65">
            {story.description}
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-ink-900/40">
            {story.meta.label}
          </p>
        </div>
      </article>
    </Link>
  );
}

function groupByCategory(stories: Story[]): Record<string, Story[]> {
  const out: Record<string, Story[]> = {};
  for (const s of stories) {
    (out[s.category] ??= []).push(s);
  }
  return out;
}
