"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Balloon } from "@/components/ui/Balloon";
import { CATEGORIES } from "@/lib/categories";

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
    { left: "6%",  top: "30%", size: 140, delay: 0,   amp: 16, dur: 11 },
    { left: "22%", top: "46%", size: 170, delay: 0.6, amp: 20, dur: 13 },
    { left: "76%", top: "32%", size: 180, delay: 0.4, amp: 22, dur: 12 },
    { left: "90%", top: "48%", size: 130, delay: 0.9, amp: 18, dur: 15 },
    { left: "50%", top: "70%", size: 110, delay: 1.1, amp: 14, dur: 14 },
  ];

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-white pt-28 pb-24 text-ink-900 sm:pt-36 sm:pb-32"
    >
      {/* Soft daytime wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #fff8e7 0%, #fff 60%, #fff 100%)",
        }}
      />

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
                className="drop-shadow-[0_18px_30px_rgba(15,23,42,0.18)]"
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
          Every place has a story.
          <br />
          <span className="text-ink-900/55">Ciro tells you, on the spot.</span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-900/65 sm:text-lg"
        >
          A mobile app that plays a short story about the place
          you&rsquo;re standing in — written, voiced, and optionally with
          an AR overlay. Live in Rome.
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
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
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
            href="mailto:info@ciroai.com?subject=Ciro%20TestFlight%20access&body=Hi%20—%20I%27d%20like%20to%20try%20the%20Ciro%20iOS%20beta.%20My%20Apple%20ID%20email%20is%3A%0A%0A"
            className="group inline-flex items-center gap-3 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-ink-900/95"
          >
            Request TestFlight access
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
          <p className="mt-2 text-xs text-ink-900/45">
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
          href="#act-historical"
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
