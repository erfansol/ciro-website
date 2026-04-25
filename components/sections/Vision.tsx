import { GlowOrb } from "../ui/GlowOrb";
import { MapBackdrop } from "../ui/MapBackdrop";
import { Reveal } from "../ui/Reveal";

export function Vision() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-32 text-white sm:py-40">
      <MapBackdrop className="-z-10" />
      <GlowOrb className="-z-10 -top-20 left-1/4" color="rose" size={520} />
      <GlowOrb className="-z-10 bottom-0 right-1/4" color="indigo" size={420} />

      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
            Our vision
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 font-display text-4xl tracking-tight text-balance leading-[1.05] sm:text-5xl md:text-6xl">
            Cities are not places.<br className="hidden sm:block" />
            They are{" "}
            <span className="bg-sunset bg-clip-text text-transparent">stories waiting</span> to be experienced.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
            We believe the next great travel company won't sell flights, beds, or tickets. It will sell time well-spent — moments that turn a trip into a memory you can still feel a decade later. Ciro is that company.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="mt-10 text-sm text-white/50">
            Founded by{" "}
            <span className="text-white/75">Erfan Soleymanzadeh</span>. Built by travelers, historians, designers, and engineers in Rome, Milan, and Tehran.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
