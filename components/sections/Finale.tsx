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
 * page commits a single sentence: the answer waits in the app.
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
      className="relative isolate flex min-h-[110svh] items-center justify-center overflow-hidden bg-[#06070d] text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
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
          The rest only opens
          <br />
          <span className="text-white/55">in your hand.</span>
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
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[#06070d] transition-colors hover:bg-white/90"
          >
            Open on iOS
          </Link>
          <Link
            href={APP_LINKS.android}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
          >
            Open on Android
          </Link>
        </motion.div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          viewport={{ once: true, margin: "-25%" }}
          className="mt-12 text-xs uppercase tracking-[0.32em] text-white/35"
        >
          Live in Rome · Milan · Paris · Barcelona soon
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
