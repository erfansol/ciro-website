import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { WaitlistForm } from "../forms/WaitlistForm";

export function Waitlist() {
  return (
    <section id="waitlist" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <Reveal>
          <Card className="relative overflow-hidden p-10 sm:p-14">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sunset opacity-30 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-brand-600/30 opacity-40 blur-3xl" />

            <div className="relative grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <SectionHeading
                  eyebrow="Early access"
                  title="Get early access to Ciro."
                  description="Be among the first 10,000 travelers to walk a city the Ciro way. Early access includes free Rome stories, lifetime founder pricing, and behind-the-scenes notes from the team."
                />
              </div>
              <div className="md:col-span-5">
                <WaitlistForm />
                <p className="mt-3 text-xs text-ink-900/50 dark:text-white/40">
                  No spam. We email twice a month, max.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
