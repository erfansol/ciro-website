import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Scribble } from "@/components/ui/Scribble";

const PRINCIPLES = [
  {
    title: "True before clever",
    body: "Every fact is checked against sources before a narrator says it. When historians disagree, the story says so.",
  },
  {
    title: "Walked, not imagined",
    body: "Before a route ships we walk it ourselves — timing each leg, checking opening hours, standing where you will stand.",
  },
  {
    title: "Eyes up, not down",
    body: "Ciro talks so you can look at the city. The phone is there for the map, the clue and the moment you want to ask.",
  },
];

/** The people and the rules behind the stories. */
export function MadeInRome() {
  return (
    <section id="made-in-rome" className="border-t border-ink-900/10 bg-[#f5f0e4] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-700">Made in Rome</p>
          <h2 className="mt-4 font-display text-balance text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-tight">
            Written by people who <Scribble>walk these streets.</Scribble> <em className="italic text-ink-900/60">Told by a voice that answers back.</em>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70">
            Ciro began as a master’s thesis at Sapienza Università di Roma and became a small studio in the city it was written about. The AI does the listening and the answering; the stories, the routes and the facts are made by hand.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.title} delay={0.08 * i}>
              <div className="h-full rounded-2xl border border-ink-900/10 bg-paper p-7">
                <span className="font-mono text-xs text-brand-700">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-2xl leading-tight">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-900/65">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-14 flex flex-col gap-8 border-t border-ink-900/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
          <ul className="flex flex-wrap gap-x-12 gap-y-6">
            <li>
              <p className="font-display text-xl">Erfan Soleymanzadeh</p>
              <p className="mt-1 text-sm text-ink-900/55">Founder · design &amp; engineering</p>
            </li>
            <li>
              <p className="font-display text-xl">Kimia Bayat</p>
              <p className="mt-1 text-sm text-ink-900/55">Co-founder · interactive storytelling</p>
            </li>
          </ul>
          <Link href="/about" className="text-xs font-medium uppercase tracking-[0.28em] text-ink-900/60 underline-offset-8 hover:text-ink-900 hover:underline">
            Our story →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
