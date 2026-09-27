"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

const STOPS = [
  { n: 1, name: "Piazza Navona", note: "Where Il Corvo opens the file", x: 70, y: 250 },
  { n: 2, name: "Palazzo Madama", note: "The cardinal who protected him", x: 150, y: 196 },
  { n: 3, name: "San Luigi dei Francesi", note: "Find his face in the crowd", x: 118, y: 128 },
  { n: 4, name: "Sant’Agostino", note: "The pilgrims with dirty feet", x: 200, y: 70 },
  { n: 5, name: "Via della Pallacorda", note: "28 May 1606 — the fight", x: 262, y: 118 },
  { n: 6, name: "The Pantheon", note: "Your verdict", x: 300, y: 222 },
];
const ROUTE = "M70 250 C100 232 128 214 150 196 C170 176 110 160 118 128 C124 100 170 88 200 70 C230 60 250 92 262 118 C276 150 296 186 300 222";

/** Spotlight on the first free story: a hand-drawn route that walks itself. */
export function FirstStory() {
  const reduced = useReducedMotion();
  return (
    <section id="first-story" className="relative overflow-hidden bg-ink-900 py-24 text-paper-50 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-300">Our first story · free</p>
          <h2 className="mt-4 font-display text-balance text-[clamp(2.2rem,4.8vw,3.8rem)] leading-[1.05] tracking-tight">
            The Fugitive’s <em className="italic text-brand-300">Last Canvas</em>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-paper-50/75">
            Rome, May 1606. A painter kills a man in a brawl by the tennis courts, and runs. Four hundred years later, a crow who kept the papal police archive asks you to walk his last days in the city — six stops, one kilometre and a bit, and a verdict at the end that is yours to give.
          </p>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-paper-50/15 pt-6">
            {[
              ["Walk", "≈ 50 min"],
              ["Stops", "6"],
              ["Best at", "golden hour"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-paper-50/50">{k}</dt>
                <dd className="mt-1 font-display text-xl">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-paper-50/55">
            In field testing now in Campo Marzio. Every church, every hour, every step is being checked on foot before it ships.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <figure className="relative mx-auto max-w-md">
            <svg viewBox="0 0 370 300" className="w-full overflow-visible" role="img" aria-label="Route map: six stops from Piazza Navona to the Pantheon">
              <g stroke="#faf7f0" strokeOpacity=".12" strokeWidth="10" strokeLinecap="round" fill="none">
                <path d="M0 210 L370 160" /><path d="M40 0 L90 300" /><path d="M170 0 L200 300" /><path d="M0 100 L370 60" /><path d="M280 0 L330 300" />
              </g>
              <path d={ROUTE} fill="none" stroke="#faf7f0" strokeOpacity=".25" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
              <motion.path
                d={ROUTE}
                fill="none"
                stroke="#d99b1e"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                whileInView={reduced ? undefined : { pathLength: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 3.2, ease: [0.65, 0, 0.35, 1] }}
              />
              {STOPS.map((s, i) => (
                <motion.g
                  key={s.n}
                  initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                  whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ delay: 0.2 + i * 0.52, type: "spring", stiffness: 320, damping: 16 }}
                  style={{ transformOrigin: `${s.x}px ${s.y}px` }}
                >
                  <circle cx={s.x} cy={s.y} r="11" fill="#0a0d16" stroke="#faf7f0" strokeWidth="2" />
                  <text x={s.x} y={s.y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#faf7f0" fontFamily="var(--font-sans)">{s.n}</text>
                </motion.g>
              ))}
            </svg>
            <ol className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {STOPS.map((s) => (
                <li key={s.n} className="flex gap-3">
                  <span className="font-mono text-xs text-brand-300">{String(s.n).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-sm text-paper-50/90">{s.name}</span>
                    <span className="block font-display text-sm italic text-paper-50/50">{s.note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
