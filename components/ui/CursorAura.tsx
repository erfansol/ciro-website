"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { CATEGORIES } from "@/lib/categories";

/**
 * Soft floating textures that trail the mouse cursor. One blurred orb
 * per brand category colour, each with progressively looser spring lag
 * so they form a comet-tail of the five Ciro colours. Pointer-events
 * are disabled and the layer uses screen blend so it lights the page
 * without obscuring text.
 *
 * Hidden on touch devices (`@media (hover: none)`) and skipped under
 * `prefers-reduced-motion`.
 */
export function CursorAura() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onLeave = () => {
      x.set(-200);
      y.set(-200);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y, reduced]);

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden [@media(hover:none)]:hidden"
      style={{ mixBlendMode: "screen" }}
    >
      {CATEGORIES.map((cat, i) => (
        <CursorOrb
          key={cat.id}
          index={i}
          color={cat.color}
          mx={x}
          my={y}
        />
      ))}
    </div>
  );
}

function CursorOrb({
  index,
  color,
  mx,
  my,
}: {
  index: number;
  color: string;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  // First orb leads (tight spring), each subsequent one falls further
  // behind to form the trail.
  const stiffness = 220 - index * 32;
  const damping = 30 - index * 2;
  const sx = useSpring(mx, { stiffness, damping, mass: 0.6 });
  const sy = useSpring(my, { stiffness, damping, mass: 0.6 });

  const size = 22 + index * 10;
  const opacity = 0.55 - index * 0.06;
  const blur = 6 + index * 2;

  return (
    <motion.span
      className="absolute rounded-full"
      style={{
        x: sx,
        y: sy,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background: `radial-gradient(circle, ${color} 0%, ${color}55 35%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        opacity,
      }}
    />
  );
}
