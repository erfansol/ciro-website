import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const PILLARS = [
  {
    icon: SparkleIcon,
    title: "AI travel assistant",
    body: "Tell Ciro the kind of day you want — slow morning, hidden art, late-night bites — and it composes a route through the city in seconds.",
  },
  {
    icon: PinIcon,
    title: "Location-based storytelling",
    body: "As you walk, Ciro narrates what you're standing on. History, gossip, design, food — only the chapters that fit the moment.",
  },
  {
    icon: ARIcon,
    title: "AR experiences in cities",
    body: "Lift your phone at landmarks and watch them transform: Roman crowds in the Colosseum, Bernini's coded jokes, Gaudí's finished forest.",
  },
  {
    icon: RouteIcon,
    title: "Personalized journeys",
    body: "Every Ciro journey is one-of-a-kind. Stories adapt to your time, taste, and the way the day actually unfolds.",
  },
];

export function WhatIsCiro() {
  return (
    <section id="what" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="What is Ciro"
          title="A travel companion that finally feels native to the 21st century."
          description="Audio guides are stuck in 2008. City apps are filled with the same Top 10 lists. Ciro is something new — a private, intelligent narrator that knows where you are, what you love, and which story to tell next."
        />

        <ul className="mt-16 grid gap-5 md:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} as="li" delay={i * 0.07}>
              <Card glow className="h-full p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sunset text-white shadow-lg shadow-brand-600/30">
                    <p.icon />
                  </div>
                  <div>
                    <h3 className="font-display text-xl tracking-tight text-ink-900 dark:text-white">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-900/70 dark:text-white/70">
                      {p.body}
                    </p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ARIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M21 7V5a2 2 0 0 0-2-2h-2M3 17v2a2 2 0 0 0 2 2h2M21 17v2a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="7" width="10" height="10" rx="2" />
    </svg>
  );
}
function RouteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <circle cx="18" cy="5" r="3" />
      <path d="M6 16V9a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" />
    </svg>
  );
}
