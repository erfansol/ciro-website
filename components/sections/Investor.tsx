import { Card } from "../ui/Card";
import { GlowOrb } from "../ui/GlowOrb";
import { MapBackdrop } from "../ui/MapBackdrop";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { PartnershipForm } from "../forms/PartnershipForm";

const MARKET = [
  {
    figure: "$1.2T",
    label: "Global tourism market by 2027",
    body: "And only 4% of it is digital-native. The category is wide open.",
  },
  {
    figure: "70%",
    label: "Of travelers want personalized experiences",
    body: "But 90% still rely on static guidebooks, generic tours, or the algorithm.",
  },
  {
    figure: "1B+",
    label: "AR-capable phones in travelers' pockets",
    body: "The hardware is finally here. The product layer isn't. We're building it.",
  },
];

export function Investor() {
  return (
    <section id="invest" className="relative isolate overflow-hidden bg-aurora py-24 text-white sm:py-32">
      <MapBackdrop className="-z-10" />
      <GlowOrb className="-z-10 -top-20 right-0" color="violet" size={520} />
      <GlowOrb className="-z-10 bottom-0 left-0" color="amber" size={380} />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Investors & partners"
          title="Build the future of travel with us."
          description="Ciro is creating a new category: AI-narrated, AR-enhanced city experiences that feel like cinema and behave like software. We're raising to expand from one city to twenty, and we're choosing partners who want to define this category, not chase it."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ul className="grid gap-4 sm:grid-cols-3">
              {MARKET.map((m, i) => (
                <Reveal key={m.label} as="li" delay={i * 0.08}>
                  <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <p className="font-display text-4xl tracking-tight bg-sunset bg-clip-text text-transparent">
                      {m.figure}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white/85">{m.label}</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/55">{m.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.1} className="mt-10">
              <Card className="bg-white/[0.04] p-8">
                <p className="font-display text-2xl text-white text-balance leading-snug">
                  "Cities are not places. They are stories waiting to be experienced."
                </p>
                <p className="mt-4 text-sm text-white/65 leading-relaxed">
                  We're starting with Rome — the city that invented tourism — and rolling out across Europe with locally-staffed editorial teams, AR partners, and a SaaS product for city tourism boards. Pitch deck and data room available on request.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="mailto:invest@ciroai.com"
                    className="text-sm font-medium text-brand-300 underline-offset-4 hover:underline"
                  >
                    invest@ciroai.com
                  </a>
                  <span className="text-sm text-white/30">·</span>
                  <a
                    href="mailto:partners@ciroai.com"
                    className="text-sm font-medium text-brand-300 underline-offset-4 hover:underline"
                  >
                    partners@ciroai.com
                  </a>
                </div>
              </Card>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal>
              <Card className="bg-white/[0.04] p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                  Connect with us
                </p>
                <h3 className="mt-2 font-display text-2xl text-white tracking-tight">
                  Invest, partner, or build with Ciro
                </h3>
                <p className="mt-2 text-sm text-white/65">
                  We respond to every serious inquiry within 48 hours.
                </p>
                <div className="mt-6">
                  <PartnershipForm />
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
