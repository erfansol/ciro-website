"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "../ui/Button";
import { GlowOrb } from "../ui/GlowOrb";
import { MapBackdrop } from "../ui/MapBackdrop";
import { PulseDot } from "../ui/Badge";
import { APP_LINKS, STATS } from "@/lib/site";

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-aurora pt-32 pb-24 text-white sm:pt-40 sm:pb-32 lg:pb-40">
      <MapBackdrop variant="hero" className="-z-10" />
      <GlowOrb className="-z-10 -top-32 -left-20" color="violet" size={520} />
      <GlowOrb className="-z-10 top-40 right-[-10%]" color="amber" size={420} />
      <GlowOrb className="-z-10 bottom-[-10%] left-1/3" color="rose" size={460} />

      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 lg:px-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur"
        >
          <PulseDot />
          <span className="text-xs font-medium tracking-wide text-white/80">
            Live in Rome · expanding to Milan, Paris, Barcelona
          </span>
        </motion.div>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl tracking-tight text-balance leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-[88px]"
        >
          Experience cities through{" "}
          <span className="bg-sunset bg-clip-text text-transparent">AI-powered stories</span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl text-lg text-white/70 leading-relaxed sm:text-xl"
        >
          Ciro is the travel companion that turns every street, square, and ruin into a chapter you can walk through. Personalized routes. Cinematic narration. Augmented reality the moment you arrive.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <ButtonLink href={APP_LINKS.ios} external size="lg" variant="primary">
            <DownloadIcon /> Download the app
          </ButtonLink>
          <ButtonLink href="/#waitlist" size="lg" variant="secondary">
            Join the waitlist
          </ButtonLink>
        </motion.div>

        <motion.dl
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 grid w-full grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="bg-ink-950/40 px-6 py-5 sm:px-8 sm:py-6">
              <dd className="font-display text-3xl text-white sm:text-4xl">
                {s.value}
                {s.suffix && <span className="ml-1 text-base text-emerald-300">{s.suffix}</span>}
              </dd>
              <dt className="mt-1 text-xs uppercase tracking-wider text-white/50">{s.label}</dt>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
