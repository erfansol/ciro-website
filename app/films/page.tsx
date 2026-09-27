import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FilmPlayer } from "@/components/films/FilmPlayer";
import { FilmGallery } from "@/components/films/FilmGallery";
import { RomeSeries } from "@/components/sections/FilmSections";
import { Reveal } from "@/components/ui/Reveal";
import { Scribble } from "@/components/ui/Scribble";
import { FILMS, filmById, filmsOfKind } from "@/lib/films";

// 5-min ISR so redeploys propagate through Hostinger's CDN (see about/page.tsx).
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Films · Ciro, drawn by hand",
  description:
    "Short hand-drawn films about Ciro and about Rome — the Colosseum, the Pantheon, Trevi and more. Played live in your browser with sound; jump to any chapter.",
  path: "/films",
});

export default function FilmsPage() {
  const credits = Array.from(new Set(FILMS.map((f) => f.music)));
  return (
    <div className="pt-32 sm:pt-40">
      <section className="mx-auto max-w-6xl px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-700">Films</p>
          <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
            Drawn by hand. <em className="italic text-ink-900/60">Played <Scribble>live</Scribble>, with sound.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg">
            These aren’t videos. Each film is drawn line by line in your browser, in time with its soundtrack — so it stays sharp on any screen, and every chapter is a click away. Space to play, arrows to skip, M to mute.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-14">
          <FilmPlayer film={filmById("intro")!} />
        </Reveal>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-700">The app, in motion</p>
          <h2 className="mt-4 font-display text-balance text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.08] tracking-tight">
            Five features, twenty seconds each.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <FilmGallery ids={filmsOfKind("feature").map((f) => f.id)} />
        </Reveal>
      </section>

      <div className="mt-16">
        <RomeSeries showLink={false} />
      </div>

      <section className="mx-auto max-w-6xl border-t border-ink-900/10 px-6 py-12 lg:px-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-900/45">Credits</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-900/60">
          Drawings, animation and sound design by Ciro. Ambient recordings from Wikimedia Commons (public domain / CC0). Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 —{" "}
          {credits.map((c, i) => (
            <span key={c}>
              {c.replace(" by Kevin MacLeod", "")}
              {i < credits.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
      </section>
    </div>
  );
}
