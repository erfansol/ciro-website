"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Balloon } from "@/components/ui/Balloon";
import { CATEGORIES } from "@/lib/categories";
import { APP_LINKS } from "@/lib/site";

/**
 * Hero. Five balloons drift across the sky. One plain-English line tells
 * the visitor exactly what Ciro is, then two app-store buttons. The
 * background flips with the theme: a soft daytime sky in light mode, a
 * starry night with an aurora wash in dark mode.
 */
export function HeroBalloons() {
  const reduced = useReducedMotion();

  // Balloon arrangement: arc across the viewport, each with its own
  // delay / amplitude so they never drift in sync.
  const layout = [
    { left: "8%", top: "22%", size: 150, delay: 0, amp: 18, dur: 11 },
    { left: "26%", top: "38%", size: 200, delay: 0.6, amp: 24, dur: 13 },
    { left: "47%", top: "16%", size: 230, delay: 1.1, amp: 28, dur: 14 },
    { left: "68%", top: "40%", size: 190, delay: 0.4, amp: 22, dur: 12 },
    { left: "85%", top: "20%", size: 160, delay: 0.9, amp: 20, dur: 15 },
  ];

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-white pb-20 text-ink-900 dark:bg-[#06070d] dark:text-white sm:pb-28"
    >
      {/* Daytime sky — light mode only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
        style={{
          background:
            "linear-gradient(180deg, #fff8e7 0%, #fff 55%, #fff 100%)",
        }}
      />

      {/* Stars + aurora — dark mode only */}
      <div className="hidden dark:block">
        <Stars />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(110,76,163,0.35) 0%, rgba(74,144,226,0.18) 30%, transparent 65%)",
          }}
        />
      </div>

      {/* Balloons */}
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
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      y: [0, -l.amp, 0, l.amp * 0.6, 0],
                      x: [0, l.amp * 0.5, 0, -l.amp * 0.4, 0],
                      rotate: [0, -2, 0, 2, 0],
                    }
              }
              transition={{
                opacity: { duration: 1.2, delay: l.delay, ease: [0.16, 1, 0.3, 1] },
                y: {
                  duration: l.dur,
                  delay: l.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                x: {
                  duration: l.dur * 1.2,
                  delay: l.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: l.dur * 0.9,
                  delay: l.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <Balloon
                color={cat.color}
                iconKey={cat.iconKey}
                size={l.size}
                ariaLabel={`${cat.label} balloon`}
                className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Single tagline + quiet CTAs */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center lg:px-8">
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-balance text-[clamp(2.6rem,6.5vw,5.4rem)] leading-[1.05] tracking-tight"
        >
          Every place has a story.
          <br />
          <span className="text-ink-900/55 dark:text-white/55">
            Ciro tells you, on the spot.
          </span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65"
        >
          A mobile app that plays a short story about the place
          you&rsquo;re standing in — written, voiced, and optionally with
          an AR overlay. Live in Rome.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href={APP_LINKS.ios}
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-900/90 dark:bg-white dark:text-[#06070d] dark:hover:bg-white/90"
          >
            Get it on iOS
          </Link>
          <Link
            href={APP_LINKS.android}
            className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 bg-white/60 px-6 py-3 text-sm font-medium text-ink-900 backdrop-blur transition-colors hover:bg-white dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Get it on Android
          </Link>
        </motion.div>

        <motion.a
          href="#act-historical"
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.6 }}
          className="group mt-16 inline-flex flex-col items-center gap-2 text-xs uppercase tracking-[0.32em] text-ink-900/45 hover:text-ink-900/80 dark:text-white/45 dark:hover:text-white/80"
        >
          <span>See how it works</span>
          <motion.span
            aria-hidden
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-6 w-px bg-ink-900/40 dark:bg-white/40"
          />
        </motion.a>
      </div>
    </section>
  );
}

function Stars() {
  // Deterministic star positions so SSR and client match.
  const seeds = [
    [4, 18], [9, 64], [13, 32], [17, 82], [22, 11], [27, 47], [31, 76],
    [35, 28], [40, 58], [45, 14], [50, 70], [55, 36], [60, 84], [65, 22],
    [70, 60], [75, 40], [80, 12], [85, 72], [90, 30], [95, 56],
    [7, 90], [19, 54], [29, 88], [39, 8], [49, 92], [58, 18],
    [68, 46], [78, 88], [88, 50],
  ];
  return (
    <div aria-hidden className="absolute inset-0 -z-20">
      {seeds.map(([l, t], i) => (
        <span
          key={i}
          className="absolute h-[2px] w-[2px] rounded-full bg-white/40"
          style={{
            left: `${l}%`,
            top: `${t}%`,
            opacity: (i % 3 === 0) ? 0.6 : 0.3,
            boxShadow: "0 0 4px rgba(255,255,255,0.4)",
          }}
        />
      ))}
    </div>
  );
}
