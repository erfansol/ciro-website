import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, getCityBySlug } from "@/lib/cities";
import { loadStoriesByCity } from "@/lib/stories";
import { buildMetadata, cityJsonLd, SITE } from "@/lib/seo";
import { Badge, PulseDot } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { NotifyMeForm } from "@/components/forms/NotifyMeForm";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { Reveal } from "@/components/ui/Reveal";

type Params = { slug: string };

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return buildMetadata({ title: "City not found", description: "", path: `/city/${slug}`, noIndex: true });

  const status = city.status === "live" ? "Live now" : `Coming ${city.releaseTarget}`;
  return buildMetadata({
    title: `${city.name}, ${city.country} — AI-powered city stories & AR tours`,
    description: `${city.teaser} ${status} on Ciro.`,
    path: `/city/${city.slug}`,
  });
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const stories = await loadStoriesByCity(slug);
  const live = city.status === "live";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            cityJsonLd({
              name: city.name,
              country: city.country,
              description: city.description,
              url: `${SITE.url}/city/${city.slug}`,
              image: city.image.src,
            }),
          ),
        }}
      />

      <header className="relative isolate overflow-hidden">
        <div className="relative h-[70vh] min-h-[520px] w-full">
          <Image
            src={city.image.src}
            alt={city.image.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-tr ${city.gradient} mix-blend-multiply opacity-40`} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
            <div className="mb-5">
              {live ? (
                <Badge tone="live"><PulseDot /> Live now</Badge>
              ) : (
                <Badge tone="soon">Coming {city.releaseTarget}</Badge>
              )}
            </div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">{city.country}</p>
            <h1 className="font-display text-6xl tracking-tight text-white sm:text-7xl md:text-8xl leading-[0.95]">
              {city.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80 leading-relaxed">{city.teaser}</p>
          </div>
        </div>
      </header>

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="The city"
              title={`What makes ${city.name} a Ciro city`}
              description={city.description}
            />

            <ul className="mt-10 space-y-3">
              {city.highlights.map((h, i) => (
                <Reveal key={i} as="li" delay={i * 0.06}>
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-sunset" />
                    <span className="text-sm leading-relaxed text-ink-900/80 dark:text-white/75">
                      {h}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              {live ? (
                <>
                  <ButtonLink href="/stories" size="md">Browse stories</ButtonLink>
                  <ButtonLink href="/#waitlist" variant="secondary" size="md">
                    Join the waitlist
                  </ButtonLink>
                </>
              ) : (
                <ButtonLink href="/stories" variant="secondary" size="md">
                  See live stories from Rome
                </ButtonLink>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <Card className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500 dark:text-brand-400">
                {live ? "Travelers in town" : `Be first into ${city.name}`}
              </p>
              <h2 className="mt-2 font-display text-2xl tracking-tight text-ink-900 dark:text-white">
                {live
                  ? `Get the Ciro experience in ${city.name}`
                  : `Notify me when ${city.name} launches`}
              </h2>
              <p className="mt-3 text-sm text-ink-900/70 dark:text-white/65 leading-relaxed">
                {live
                  ? "Download the app, open it within the city, and the streets begin telling their stories."
                  : `We're opening ${city.name} ${city.releaseTarget?.toLowerCase()}. Drop your email and we'll send your invitation the moment it goes live.`}
              </p>
              <div className="mt-5">
                {live ? (
                  <WaitlistForm source={`city-${city.slug}`} />
                ) : (
                  <NotifyMeForm citySlug={city.slug} cityName={city.name} />
                )}
              </div>
            </Card>
          </aside>
        </div>
      </section>

      {stories.length > 0 && (
        <section className="border-t border-ink-900/8 dark:border-white/5 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading
              eyebrow="Featured stories"
              title={`Inside ${city.name}`}
              description={`A taste of the ${city.storiesCount || stories.length}+ stories ready to walk.`}
            />
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((s, i) => (
                <Reveal key={s.id} as="li" delay={(i % 3) * 0.06}>
                  <Link href={`/stories/${s.id}`} className="block h-full">
                    <Card className="h-full overflow-hidden transition-transform hover:-translate-y-0.5">
                      <div
                        className="relative h-40"
                        style={{
                          background: `linear-gradient(135deg, ${s.meta.color} 0%, rgba(10,13,22,0.85) 100%)`,
                        }}
                      >
                        <span className="absolute left-5 top-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
                          {s.meta.label}
                        </span>
                        <div className="absolute right-4 top-4 flex gap-2">
                          {s.hasAr && <Badge tone="ar">AR</Badge>}
                          {s.durationLabel && <Badge tone="neutral">{s.durationLabel}</Badge>}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-display text-lg tracking-tight text-ink-900 dark:text-white">
                          {s.title}
                        </h3>
                        <p className="mt-2 text-sm text-ink-900/65 dark:text-white/65 leading-relaxed">
                          {s.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/50 dark:text-white/40">
            Other cities
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/city/${c.slug}`}
                  className="block rounded-2xl border border-ink-900/8 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] p-5 hover:border-ink-900/15 dark:hover:border-white/20 transition-colors"
                >
                  <p className="text-xs uppercase tracking-wider text-ink-900/50 dark:text-white/40">
                    {c.country}
                  </p>
                  <p className="mt-1 font-display text-xl text-ink-900 dark:text-white">{c.name}</p>
                  <p className="mt-2 text-xs text-ink-900/60 dark:text-white/50">
                    {c.status === "live" ? "Live now" : `Coming ${c.releaseTarget}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
