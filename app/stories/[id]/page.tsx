import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import {
  loadStoryById,
  loadStories,
  CATEGORY_BY_ID,
} from "@/lib/stories";
import { APP_LINKS } from "@/lib/site";
import { buildMetadata, SITE } from "@/lib/seo";

export const revalidate = 60;

type Params = { id: string };

export async function generateStaticParams() {
  const all = await loadStories();
  return all.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const story = await loadStoryById(id);
  if (!story) {
    return buildMetadata({
      title: "Story not found",
      description: "",
      path: `/stories/${id}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: `${story.title} · ${story.city}`,
    description: story.description.slice(0, 200),
    path: `/stories/${story.id}`,
  });
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const story = await loadStoryById(id);
  if (!story) notFound();

  const category = CATEGORY_BY_ID[story.category];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: story.title,
    description: story.description,
    inLanguage: "en",
    url: `${SITE.url}/stories/${story.id}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
    },
    author: { "@type": "Organization", name: SITE.legalName },
    about:
      story.lat !== undefined && story.lon !== undefined
        ? {
            "@type": "Place",
            name: story.city,
            geo: {
              "@type": "GeoCoordinates",
              latitude: story.lat,
              longitude: story.lon,
            },
          }
        : { "@type": "Place", name: story.city },
    keywords: [story.city, category.label, ...story.moods].join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="relative isolate min-h-screen overflow-hidden bg-[#06070d] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse at 50% -10%, ${category.color}55 0%, transparent 50%)`,
          }}
        />

        <article className="mx-auto max-w-3xl px-6 pt-32 pb-32 lg:px-8">
          <Link
            href="/stories"
            className="text-xs uppercase tracking-[0.28em] text-white/45 hover:text-white/80"
          >
            ← All stories
          </Link>

          <p
            className="mt-10 text-[11px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: category.color }}
          >
            {category.label} · {story.city}
          </p>

          <h1 className="mt-5 font-display text-balance text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.05] tracking-tight">
            {story.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {story.hasAr && <Badge tone="ar">AR</Badge>}
            {story.durationLabel && (
              <Badge tone="neutral">{story.durationLabel}</Badge>
            )}
            {story.lat !== undefined && story.lon !== undefined && (
              <span className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                {story.lat.toFixed(3)}° {story.lat >= 0 ? "N" : "S"} ·{" "}
                {story.lon.toFixed(3)}° {story.lon >= 0 ? "E" : "W"}
              </span>
            )}
          </div>

          <div className="mt-12 max-w-prose text-lg leading-[1.7] text-white/80">
            {story.description.split(/\n\n+/).map((p, i) => (
              <p key={i} className={i === 0 ? "" : "mt-6"}>
                {p}
              </p>
            ))}
          </div>

          {story.moods.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2">
              {story.moods.map((m) => (
                <li
                  key={m}
                  className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55"
                >
                  #{m}
                </li>
              ))}
            </ul>
          )}

          <section
            className="mt-16 rounded-3xl border p-8"
            style={{ borderColor: `${category.color}55`, background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-xs uppercase tracking-[0.32em] text-white/55">
              Walk it
            </p>
            <p className="mt-3 font-display text-2xl tracking-tight">
              The story unfolds in {story.city}, in your hand.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={APP_LINKS.ios}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#06070d] transition-colors hover:bg-white/90"
              >
                Open on iOS
              </Link>
              <Link
                href={APP_LINKS.android}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Open on Android
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
