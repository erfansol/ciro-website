"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Balloon } from "@/components/ui/Balloon";
import type { Story, StoryCategoryMeta } from "@/lib/categories";

type ActsSpineProps = {
  acts: Array<{ category: StoryCategoryMeta; story: Story | null }>;
};

/**
 * Five full-viewport "acts" — one per category. Each act drifts a giant
 * branded balloon across the screen with parallax and reveals one quiet
 * teaser sentence pulled from a real Firestore story (or fallback).
 */
export function ActsSpine({ acts }: ActsSpineProps) {
  return (
    <div>
      {acts.map((a, i) => (
        <Act
          key={a.category.id}
          index={i}
          category={a.category}
          story={a.story}
        />
      ))}
    </div>
  );
}

function Act({
  index,
  category,
  story,
}: {
  index: number;
  category: StoryCategoryMeta;
  story: Story | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Balloon parallax — drifts from low/right to high/left as the section
  // passes through the viewport.
  const balloonY = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const balloonX = useTransform(
    scrollYProgress,
    [0, 1],
    index % 2 === 0 ? [80, -40] : [-80, 40],
  );
  const balloonRotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const balloonScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.85, 1.05, 0.95],
  );

  // Background wash intensifies in the middle of the section.
  const washOpacity = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    [0, 0.55, 0.55, 0],
  );

  const balloonStyle = reduced
    ? undefined
    : {
        y: balloonY,
        x: balloonX,
        rotate: balloonRotate,
        scale: balloonScale,
      };

  // Coordinates teaser, e.g. "41.890° N · 12.492° E"
  const coords =
    story?.lat !== undefined && story?.lon !== undefined
      ? `${story.lat.toFixed(3)}° ${story.lat >= 0 ? "N" : "S"} · ${story.lon.toFixed(3)}° ${story.lon >= 0 ? "E" : "W"}`
      : null;

  return (
    <section
      ref={ref}
      id={`act-${category.id.replace(/_/g, "-")}`}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#06070d] text-white"
    >
      {/* Color wash that bleeds in mid-section */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at ${index % 2 === 0 ? "80%" : "20%"} 50%, ${category.color}55 0%, ${category.color}1a 35%, transparent 70%)`,
          opacity: washOpacity,
        }}
      />

      {/* Big drifting balloon */}
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute -z-0 ${
          index % 2 === 0 ? "right-[-4%] top-[8%]" : "left-[-4%] top-[8%]"
        }`}
        style={balloonStyle}
      >
        <Balloon
          color={category.color}
          iconKey={category.iconKey}
          size={460}
          className="drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
        />
      </motion.div>

      {/* Text — kept deliberately spare. */}
      <div
        className={`relative z-10 mx-auto flex w-full max-w-7xl px-6 lg:px-8 ${
          index % 2 === 0 ? "" : "justify-end"
        }`}
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-20%" }}
          className="max-w-md"
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.32em]"
            style={{ color: category.color }}
          >
            Act {String(index + 1).padStart(2, "0")} · {category.label}
          </p>

          <h2 className="mt-6 font-display text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
            {category.tagline}
          </h2>

          {story ? (
            <div className="mt-10 border-l border-white/15 pl-5">
              {coords && (
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
                  {story.city} · {coords}
                </p>
              )}
              <p className="mt-3 font-display text-xl text-white/90">
                {story.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {firstLine(story.description)}
              </p>
              <Link
                href={`/stories/${story.id}`}
                className="mt-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-white/70 transition-colors hover:text-white"
              >
                Open the story
                <span aria-hidden>›</span>
              </Link>
            </div>
          ) : (
            <p className="mt-10 text-sm leading-relaxed text-white/45">
              Coming soon. The first {category.label.toLowerCase()} stories are still being written.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/** First sentence (or first 140 chars) — keeps the tease quiet. */
function firstLine(text: string): string {
  if (!text) return "";
  const dot = text.indexOf(".");
  if (dot > 20 && dot < 180) return text.slice(0, dot + 1);
  return text.length > 160 ? `${text.slice(0, 160).trimEnd()}…` : text;
}
