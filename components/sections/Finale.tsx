"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Balloon } from "@/components/ui/Balloon";
import { CATEGORIES, type StoryCategoryMeta } from "@/lib/categories";
import { APP_LINKS } from "@/lib/site";

/**
 * Closing act. The five balloons converge over a single point and the
 * page calls the visitor to install. One direct line, two app buttons,
 * one cities list. Theme-aware so it reads in both light and dark.
 */
export function Finale() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const positions = [
    { fromX: -360, fromY: -140 },
    { fromX: -180, fromY: 180 },
    { fromX: 0, fromY: -240 },
    { fromX: 200, fromY: 160 },
    { fromX: 360, fromY: -120 },
  ];

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[110svh] items-center justify-center overflow-hidden bg-white text-ink-900 dark:bg-[#06070d] dark:text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(15,23,42,0.06) 0%, transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10) 0%, transparent 55%)",
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        {CATEGORIES.map((cat, i) => (
          <ConvergingBalloon
            key={cat.id}
            category={cat}
            from={positions[i]}
            scrollYProgress={scrollYProgress}
            reduced={!!reduced}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center lg:px-8">
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-25%" }}
          className="font-display text-balance text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[1.05] tracking-tight"
        >
          Open Ciro and start walking.
          <br />
          <span className="text-ink-900/55 dark:text-white/55">
            The first three stories are free.
          </span>
        </motion.h2>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          viewport={{ once: true, margin: "-25%" }}
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href={APP_LINKS.ios}
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-ink-900/90 dark:bg-white dark:text-[#06070d] dark:hover:bg-white/90"
          >
            Get it on iOS
          </Link>
          <Link
            href={APP_LINKS.android}
            className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 bg-white/60 px-7 py-3.5 text-sm font-medium text-ink-900 backdrop-blur transition-colors hover:bg-white dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Get it on Android
          </Link>
        </motion.div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          viewport={{ once: true, margin: "-25%" }}
          className="mt-12 text-xs uppercase tracking-[0.32em] text-ink-900/50 dark:text-white/35"
        >
          Live in Rome · Milan, Paris and Barcelona coming soon
        </motion.p>
      </div>
    </section>
  );
}

function ConvergingBalloon({
  category,
  from,
  scrollYProgress,
  reduced,
}: {
  category: StoryCategoryMeta;
  from: { fromX: number; fromY: number };
  scrollYProgress: MotionValue<number>;
  reduced: boolean;
}) {
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [from.fromX, 0],
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [from.fromY, 0],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.85, 1],
    [0, 0.85, 1, 0.6],
  );
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1.1]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        x,
        y,
        opacity,
        scale,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <Balloon
        color={category.color}
        iconKey={category.iconKey}
        size={130}
        className="drop-shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
      />
    </motion.div>
  );
}
