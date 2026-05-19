"use client";

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

/**
 * Closing act. The five balloons converge toward the centre and the
 * page makes one quiet, honest ask — the app is on TestFlight, write
 * to us and we'll add you. No app-store buttons (there's no public
 * App Store listing yet) and no fake city availability claims.
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
      className="relative isolate flex min-h-[110svh] items-center justify-center overflow-hidden bg-white text-ink-900"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(15,23,42,0.05) 0%, transparent 55%)",
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
          Walk Rome with us.
          <br />
          <span className="text-ink-900/55">
            We&rsquo;re adding testers manually.
          </span>
        </motion.h2>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          viewport={{ once: true, margin: "-25%" }}
          className="mt-12 flex flex-col items-center justify-center gap-2"
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
            iOS only for now. Send your Apple ID email — we add you the same day.
          </p>
        </motion.div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          viewport={{ once: true, margin: "-25%" }}
          className="mt-12 text-[10px] uppercase tracking-[0.32em] text-ink-900/40"
        >
          Live in Rome · Italy expansion next
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
        size={130}
        className="drop-shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
      />
    </motion.div>
  );
}
