"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section";
};

export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: Props) {
  const reduced = useReducedMotion();

  const motionProps: HTMLMotionProps<"div"> = {
    className,
    initial: reduced ? false : { opacity: 0, y },
    whileInView: reduced ? undefined : { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
    viewport: { once: true, margin: "-80px" },
  };

  if (as === "li") {
    return <motion.li {...(motionProps as HTMLMotionProps<"li">)}>{children}</motion.li>;
  }
  if (as === "section") {
    return <motion.section {...(motionProps as HTMLMotionProps<"section">)}>{children}</motion.section>;
  }
  return <motion.div {...motionProps}>{children}</motion.div>;
}
