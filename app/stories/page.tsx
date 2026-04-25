import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { STORIES } from "@/lib/stories";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Stories — discover cities through cinematic narratives",
  description:
    "Hand-crafted location stories from Rome, Milan, Paris, and Barcelona. Each story is a 5–15 minute cinematic narrative narrated as you walk, with optional AR overlays.",
  path: "/stories",
});

export default function StoriesPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden bg-aurora pt-32 pb-16 text-white sm:pt-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Library"
            title="Stories that turn streets into chapters."
            description="Every Ciro story is written by a local, narrated cinematic-style, and tied to a specific corner of a city. Press play, walk, listen — the world rearranges itself around you."
          />
        </div>
      </header>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STORIES.map((story, i) => (
              <Reveal key={story.id} as="li" delay={(i % 3) * 0.06}>
                <Card className="group flex h-full flex-col overflow-hidden">
                  <div className={`relative h-48 bg-gradient-to-br ${story.gradient}`}>
                    <div className="absolute inset-0 bg-grid-dark [background-size:20px_20px] opacity-30" />
                    <span className="absolute left-5 top-5 text-5xl drop-shadow-lg" aria-hidden>
                      {story.emoji}
                    </span>
                    <div className="absolute right-4 top-4 flex gap-2">
                      {story.ar && <Badge tone="ar">AR</Badge>}
                      <Badge tone="neutral">{story.duration}</Badge>
                    </div>
                    <div className="absolute bottom-4 left-5 right-5">
                      <p className="text-xs uppercase tracking-wider text-white/70">
                        {story.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl tracking-tight text-ink-900 dark:text-white">
                      {story.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-900/70 dark:text-white/70">
                      {story.narrative}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <Link
                        href={`/city/${story.citySlug}`}
                        className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        {story.cityName}
                      </Link>
                      <Button variant="secondary" size="sm" disabled>
                        {story.ar ? "Explore in AR" : "Open story"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
