"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Balloon } from "@/components/ui/Balloon";
import { CATEGORIES } from "@/lib/categories";
import { Scribble } from "@/components/ui/Scribble";

/**
 * Hero. Five quiet, coloured balloons drift across a soft daytime sky.
 * The headline sits comfortably below the nav, a single, honest CTA
 * routes interested testers to an email request flow (the app is on
 * TestFlight only — we add testers manually), and a thin coordinate
 * stamp under the description expresses the brand idea: every story
 * is tied to a real place.
 */
export function HeroBalloons() {
  const reduced = useReducedMotion();

  const layout = [
    { left: "5%",  top: "24%", size: 140, delay: 0,   amp: 16, dur: 11 },
    { left: "12%", top: "58%", size: 150, delay: 0.6, amp: 20, dur: 13 },
    { left: "79%", top: "22%", size: 170, delay: 0.4, amp: 22, dur: 12 },
    { left: "90%", top: "50%", size: 125, delay: 0.9, amp: 18, dur: 15 },
    { left: "81%", top: "74%", size: 100, delay: 1.1, amp: 14, dur: 14 },
  ];

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-paper pt-28 pb-24 text-ink-900 sm:pt-36 sm:pb-32"
    >
      {/* Balloons — kept calm, smaller, and pushed to the sides so the
          centred headline reads cleanly. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        {CATEGORIES.map((cat, i) => {
          const l = layout[i];
          return (
            <motion.div
              key={cat.id}
              className="absolute"
              style={{ left: l.left, top: l.top }}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={
                reduced
                  ? { opacity: 0.9 }
                  : {
                      opacity: 0.9,
                      y: [0, -l.amp, 0, l.amp * 0.6, 0],
                      x: [0, l.amp * 0.5, 0, -l.amp * 0.4, 0],
                      rotate: [0, -2, 0, 2, 0],
                    }
              }
              transition={{
                opacity: { duration: 1.2, delay: l.delay, ease: [0.16, 1, 0.3, 1] },
                y: { duration: l.dur, delay: l.delay, repeat: Infinity, ease: "easeInOut" },
                x: { duration: l.dur * 1.2, delay: l.delay, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: l.dur * 0.9, delay: l.delay, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <Balloon
                color={cat.color}
                size={l.size}
                ariaLabel={`${cat.label} balloon`}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Centred content */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 text-center lg:px-8">
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-balance text-[clamp(2.4rem,6vw,5rem)] leading-[1.05] tracking-tight"
        >
          Every street has a <Scribble delay={1.1}>story.</Scribble>
          <br />
          <em className="italic text-ink-900/60">Ciro tells it to you, on the spot.</em>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-900/65 sm:text-lg"
        >
          Stand anywhere in Rome and a narrator tells you what happened right
          there, then answers your questions, in your language. Real history,
          walkable routes, and a little mystery. Live in Rome.
        </motion.p>

        {/* Brand idea, expressed quietly — a coordinate stamp. */}
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.65 }}
          aria-hidden
          className="mt-10 flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.32em] text-ink-900/40"
        >
          <span className="h-px w-10 bg-ink-900/15" />
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#d99b1e]" />
            Roma · 41.890°N · 12.492°E
          </span>
          <span className="h-px w-10 bg-ink-900/15" />
        </motion.div>

        {/* Single, honest CTA — the app is in TestFlight only. */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col items-center justify-center gap-2"
        >
          <a
            href="mailto:info@ciroai.com?subject=Ciro%20TestFlight%20access&body=Hi%2C%20I%27d%20like%20to%20try%20the%20Ciro%20iOS%20beta.%20My%20Apple%20ID%20email%20is%3A%0A%0A"
            className="group inline-flex items-center gap-3 rounded-md bg-ink-900 px-7 py-3.5 text-sm font-medium text-paper-50 transition-colors duration-200 hover:bg-ink-800"
          >
            Request TestFlight access
            <span aria-hidden>→</span>
          </a>
          <a
            href="#film"
            className="group mt-3 inline-flex items-center gap-2.5 text-sm font-medium text-ink-900/75 transition-colors hover:text-ink-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-900/20 transition-colors group-hover:border-ink-900/50">
              <svg width="9" height="11" viewBox="0 0 12 14" aria-hidden fill="currentColor"><path d="M1 1.2v11.6c0 .6.7 1 1.2.7l9.3-5.8a.8.8 0 0 0 0-1.4L2.2.5C1.7.2 1 .6 1 1.2Z" /></svg>
            </span>
            Watch the film <span className="font-mono text-xs text-ink-900/45">0:35</span>
          </a>
          <p className="mt-3 text-xs text-ink-900/45">
            Email{" "}
            <a
              href="mailto:info@ciroai.com"
              className="underline-offset-4 hover:underline"
            >
              info@ciroai.com
            </a>{" "}
            and we add you to the iOS TestFlight build manually.
          </p>
        </motion.div>

        <motion.a
          href="#film"
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.4 }}
          className="group mt-16 inline-flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-ink-900/40 hover:text-ink-900/70"
        >
          <span>See how it works</span>
          <motion.span
            aria-hidden
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-6 w-px bg-ink-900/30"
          />
        </motion.a>
      </div>
    </section>
  );
}
