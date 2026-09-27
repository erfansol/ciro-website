import Link from "next/link";
import { FilmPlayer } from "@/components/films/FilmPlayer";
import { FilmGallery } from "@/components/films/FilmGallery";
import { Reveal } from "@/components/ui/Reveal";
import { Scribble } from "@/components/ui/Scribble";
import { filmById, filmsOfKind } from "@/lib/films";

/** The 35-second intro film, played inline with sound. */
export function IntroFilm() {
  const wide = filmById("intro")!;
  const tall = filmById("intro-vertical")!;
  return (
    <section id="film" className="scroll-mt-24 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-700">A 35-second film</p>
          <h2 className="mt-4 font-display text-balance text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-tight">
            Rome has told stories for two thousand years. <em className="italic text-ink-900/60">Now it <Scribble>tells them</Scribble> to you.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-900/65">
            Drawn by hand, scored for sound, and played live in your browser. Press play, or jump to any chapter.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <div className="hidden md:block">
            <FilmPlayer film={wide} />
          </div>
          <div className="md:hidden">
            <FilmPlayer film={tall} frameClassName="h-[70svh] w-auto max-w-full" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Five short films, one per feature — what using Ciro actually feels like. */
export function FeatureFilms() {
  return (
    <section id="feel" className="border-t border-ink-900/10 bg-[#f5f0e4] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-700">What it feels like</p>
          <h2 className="mt-4 font-display text-balance text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-tight">
            Less like an audio guide. <em className="italic text-ink-900/60">More like a friend who knows the city.</em>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-900/65">
            Twenty seconds each. Tap one and turn the sound on.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <FilmGallery ids={filmsOfKind("feature").map((f) => f.id)} />
        </Reveal>
      </div>
    </section>
  );
}

/** "Rome, told by Ciro" — six landmarks, three facts each. */
export function RomeSeries({ showLink = true }: { showLink?: boolean }) {
  return (
    <section id="rome" className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-700">A series · Rome, told by Ciro</p>
            <h2 className="mt-4 font-display text-balance text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-tight">
              Every stone has a story. <em className="italic text-ink-900/60">Here are six.</em>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-900/65">
              One question, three true facts, and the place to stand when you want the rest. Each chapter is a fact — skip straight to the one you want.
            </p>
          </div>
          {showLink && (
            <Link href="/films" className="shrink-0 text-xs font-medium uppercase tracking-[0.28em] text-ink-900/60 underline-offset-8 hover:text-ink-900 hover:underline">
              All films →
            </Link>
          )}
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <FilmGallery ids={filmsOfKind("rome").map((f) => f.id)} numbered />
        </Reveal>
      </div>
    </section>
  );
}
