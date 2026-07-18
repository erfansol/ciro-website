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
            <div className="relative grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <SectionHeading
                  eyebrow="Early access"
                  title="Be the first to try Ciro."
                  description="Join the early list and you get free Rome stories at launch, plus founder pricing for life. We email twice a month, no more."
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
