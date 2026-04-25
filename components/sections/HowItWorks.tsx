import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const STEPS = [
  {
    n: "01",
    title: "Open Ciro",
    body: "Tell us where you are and what kind of day you want. A morning of hidden art? A night of street food? A 90-minute layover walk? Ciro composes the route in seconds.",
  },
  {
    n: "02",
    title: "Explore stories around you",
    body: "Ciro narrates as you walk. Pause when something catches your eye. Skip what doesn't. The story always picks up where you left off — and never repeats itself.",
  },
  {
    n: "03",
    title: "Unlock hidden experiences in real time",
    body: "AR overlays reveal what's no longer there: vanished frescoes, ancient crowds, buildings that haven't been built yet. The city becomes a living, layered film.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps. The city does the rest."
          description="No PDFs to download. No tour guides to wait for. No museum queues. Open the app and the city starts talking — only about what you actually care about."
        />

        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} as="li" delay={i * 0.1}>
              <Card glow className="relative h-full p-8">
                <div className="font-display text-6xl bg-sunset bg-clip-text text-transparent leading-none">
                  {step.n}
                </div>
                <h3 className="mt-6 font-display text-2xl tracking-tight text-ink-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-900/70 dark:text-white/70">
                  {step.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
