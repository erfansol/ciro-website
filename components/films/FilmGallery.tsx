"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FilmPlayer } from "./FilmPlayer";
import { FILM_ASSET, filmById, type Film } from "@/lib/films";
import { cn } from "@/lib/cn";

/**
 * A row of film posters. Tapping one opens it in a quiet paper-coloured
 * modal with sound. On phones the row scrolls sideways, like a contact sheet.
 */
export function FilmGallery({
  ids,
  numbered = false,
  className,
}: {
  ids: string[];
  numbered?: boolean;
  className?: string;
}) {
  const films = ids.map(filmById).filter(Boolean) as Film[];
  const [open, setOpen] = useState<Film | null>(null);

  return (
    <>
      <ul
        className={cn(
          "-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:overflow-visible lg:px-0",
          films.length >= 6 ? "lg:grid-cols-6" : films.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4",
          className,
        )}
      >
        {films.map((f, i) => (
          <li key={f.id} className="w-[46vw] max-w-[15rem] shrink-0 snap-start sm:w-[30vw] lg:w-auto lg:max-w-none">
            <button type="button" onClick={() => setOpen(f)} className="group block w-full text-left" aria-label={`Play “${f.title}”`}>
              <span className="relative block aspect-[9/16] overflow-hidden rounded-[1.4rem] bg-[#f3eee2] ring-1 ring-ink-900/10 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:rotate-[-0.6deg] group-hover:shadow-[0_24px_40px_-24px_rgba(10,13,22,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={FILM_ASSET(f.id).poster} alt="" loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink-900/90 text-paper-50 transition-transform duration-300 group-hover:scale-110">
                  <svg width="11" height="13" viewBox="0 0 12 14" aria-hidden fill="currentColor"><path d="M1 1.2v11.6c0 .6.7 1 1.2.7l9.3-5.8a.8.8 0 0 0 0-1.4L2.2.5C1.7.2 1 .6 1 1.2Z" /></svg>
                </span>
                <span className="absolute bottom-4 right-3 rounded-full bg-paper/90 px-2 py-0.5 font-mono text-[10px] text-ink-900/70">
                  0:{String(Math.round(f.duration)).padStart(2, "0")}
                </span>
              </span>
              <span className="mt-3 block">
                {numbered && (
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-700">
                    Nº {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="mt-1 block font-display text-lg leading-snug">{f.title}</span>
                <span className="mt-1 block text-sm leading-snug text-ink-900/60">{f.blurb}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open && <FilmModal film={open} onClose={() => setOpen(null)} />}
    </>
  );
}

export function FilmModal({ film, onClose }: { film: Film; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  const vertical = film.aspect === "9/16";
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={film.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/75 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className={cn(
          "relative max-h-[96svh] w-full overflow-y-auto rounded-3xl bg-paper p-5 outline-none sm:p-7",
          vertical ? "max-w-[30rem]" : "max-w-5xl",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-700">
              {film.kind === "rome" ? "Rome, told by Ciro" : "A Ciro film"}
            </p>
            <h3 className="mt-1 font-display text-2xl leading-tight">{film.title}</h3>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-900/15 text-ink-900/70 transition-colors hover:border-ink-900/40 hover:text-ink-900"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 1l10 10M11 1L1 11" /></svg>
          </button>
        </div>
        <FilmPlayer
          film={film}
          autoPlay
          frameClassName={vertical ? "h-[min(62svh,46rem)] w-auto max-w-full" : undefined}
        />
        <p className="mt-5 text-[11px] leading-relaxed text-ink-900/45">
          Music: {film.music} (incompetech.com), CC BY 4.0. Sound design and drawings by Ciro.
        </p>
      </div>
    </div>
  );
}
