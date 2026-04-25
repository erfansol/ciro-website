import Image from "next/image";
import Link from "next/link";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { Badge, PulseDot } from "../ui/Badge";
import { Card } from "../ui/Card";
import { CITIES } from "@/lib/cities";
import { NotifyMeForm } from "../forms/NotifyMeForm";

export function FeaturedCities() {
  return (
    <section id="cities" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Cities"
            title="Live in Rome. Ready to take Europe."
            description="Each Ciro city is hand-curated with local storytellers, historians, and AR designers. We don't scrape Wikipedia — we build the city, story by story."
          />
          <Link
            href="/stories"
            className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            Browse all stories →
          </Link>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {CITIES.map((city, i) => (
            <Reveal key={city.slug} as="li" delay={i * 0.07}>
              <Card className="group h-full overflow-hidden">
                <Link href={`/city/${city.slug}`} className="block focus:outline-none">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={city.image.src}
                      alt={city.image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={i < 2}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-tr ${city.gradient} mix-blend-multiply opacity-30`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
                    <div className="absolute left-5 top-5">
                      {city.status === "live" ? (
                        <Badge tone="live"><PulseDot /> Live now</Badge>
                      ) : (
                        <Badge tone="soon">Coming {city.releaseTarget}</Badge>
                      )}
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-xs uppercase tracking-wider text-white/70">
                        {city.country}
                      </p>
                      <h3 className="font-display text-3xl tracking-tight text-white">
                        {city.name}
                      </h3>
                    </div>
                  </div>
                </Link>

                <div className="p-7">
                  <p className="text-sm leading-relaxed text-ink-900/75 dark:text-white/70">
                    {city.teaser}
                  </p>

                  {city.status === "live" ? (
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm text-ink-900/60 dark:text-white/50">
                        {city.storiesCount} stories ready
                      </span>
                      <Link
                        href={`/city/${city.slug}`}
                        className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Open the city →
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <p className="mb-2 text-xs uppercase tracking-wider text-ink-900/50 dark:text-white/40">
                        Get notified
                      </p>
                      <NotifyMeForm citySlug={city.slug} cityName={city.name} />
                    </div>
                  )}
                </div>
              </Card>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
