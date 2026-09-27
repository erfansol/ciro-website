"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a word with a hand-drawn gold underline that draws itself in when
 * it scrolls into view — the same pencil stroke the Ciro films use.
 */
export function Scribble({ children, delay = 0.4 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.18em] left-[-2%] h-[0.32em] w-[104%] overflow-visible"
      >
        <motion.path
          d="M2 10 C 40 4, 80 13, 120 7 S 180 5, 198 9"
          fill="none"
          stroke="#d99b1e"
          strokeWidth="3.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduced ? false : { pathLength: 0 }}
          whileInView={reduced ? undefined : { pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
    </span>
  );
}
