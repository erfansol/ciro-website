"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FILM_ASSET, type Film } from "@/lib/films";
import { cn } from "@/lib/cn";

type FilmWindow = Window & { renderAt?: (t: number) => void; ready?: Promise<void> };

/**
 * Plays a Ciro film. The drawing lives in a same-origin iframe that exposes
 * `renderAt(t)`; the soundtrack is a plain <audio>. While playing, every
 * animation frame reads the audio clock and redraws the film at that exact
 * moment, so seeking, pausing and chapter jumps keep picture and sound in
 * lock-step. If audio can't load, a wall clock drives it silently.
 */
export function FilmPlayer({
  film,
  autoPlay = false,
  className,
  compact = false,
  frameClassName,
}: {
  film: Film;
  autoPlay?: boolean;
  className?: string;
  compact?: boolean;
  /** Extra classes for the picture frame, e.g. a height cap in a modal. */
  frameClassName?: string;
}) {
  const asset = FILM_ASSET(film.id);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);
  const clockRef = useRef<{ start: number; from: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [t, setT] = useState(film.posterT);
  const silentRef = useRef(false);
  const soundRef = useRef<Promise<void> | null>(null);
  const loadSound = useCallback(() => {
    if (!soundRef.current) {
      soundRef.current = fetch(asset.audio)
        .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
        .then((b) => {
          if (audioRef.current) audioRef.current.src = URL.createObjectURL(b);
        })
        .catch(() => {
          silentRef.current = true;
        });
    }
    return soundRef.current;
  }, [asset.audio]);
  const posRef = useRef(film.posterT);

  const draw = useCallback((time: number) => {
    const w = frameRef.current?.contentWindow as FilmWindow | null;
    w?.renderAt?.(Math.max(0, Math.min(time, film.duration)));
  }, [film.duration]);

  const setPos = useCallback((time: number) => {
    posRef.current = time;
    setT(time);
    draw(time);
  }, [draw]);

  // The picture never waits for the network: a wall clock drives it from the
  // moment you press play, and the soundtrack joins at the same position as
  // soon as it has loaded. Once sound is running, its clock takes over.
  const audioLiveRef = useRef(false);
  const playingRef = useRef(false);
  const clockNow = () => {
    const c = clockRef.current;
    return c ? c.from + (performance.now() - c.start) / 1000 : posRef.current;
  };
  const now = () => (audioLiveRef.current && audioRef.current ? audioRef.current.currentTime : clockNow());

  const joinSound = useCallback(async () => {
    await loadSound();
    const a = audioRef.current;
    if (!a || silentRef.current || !playingRef.current || audioLiveRef.current) return;
    a.currentTime = clockNow();
    try {
      await a.play();
      if (playingRef.current) audioLiveRef.current = true;
      else a.pause();
    } catch {
      silentRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSound]);

  const startAt = useCallback((from: number) => {
    setStarted(true);
    setEnded(false);
    setPos(from);
    clockRef.current = { start: performance.now(), from };
    playingRef.current = true;
    setPlaying(true);
    joinSound();
  }, [setPos, joinSound]);

  const play = useCallback(() => {
    startAt(!started || ended || posRef.current >= film.duration - 0.05 ? 0 : posRef.current);
  }, [started, ended, film.duration, startAt]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    audioLiveRef.current = false;
    playingRef.current = false;
    clockRef.current = null;
    setPlaying(false);
  }, []);

  const seek = useCallback((time: number) => {
    const x = Math.max(0, Math.min(time, film.duration - 0.01));
    if (audioLiveRef.current && audioRef.current) audioRef.current.currentTime = x;
    clockRef.current = { start: performance.now(), from: x };
    setStarted(true);
    setEnded(false);
    setPos(x);
  }, [film.duration, setPos]);

  // frame loop while playing
  useEffect(() => {
    if (!playing) return;
    const loop = () => {
      const time = now();
      if (time >= film.duration) {
        setPos(film.duration);
        audioLiveRef.current = false;
        playingRef.current = false;
        setPlaying(false);
        setEnded(true);
        return;
      }
      setPos(time);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, film.duration, setPos]);

  // only one film plays at a time across the page
  const selfId = useRef(Math.random().toString(36).slice(2));
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== selfId.current) pause();
    };
    window.addEventListener("ciro:film-play", onOther);
    return () => window.removeEventListener("ciro:film-play", onOther);
  }, [pause]);
  useEffect(() => {
    if (playing) window.dispatchEvent(new CustomEvent("ciro:film-play", { detail: selfId.current }));
  }, [playing]);

  // stop the soundtrack if the player unmounts mid-film (e.g. modal closed)
  useEffect(() => () => audioRef.current?.pause(), []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const onFrameLoad = useCallback(async () => {
    const w = frameRef.current?.contentWindow as FilmWindow | null;
    try {
      await w?.ready;
    } catch {
      /* fonts failed — the film still draws with fallbacks */
    }
    setReady(true);
    draw(film.posterT);
    loadSound();
    if (autoPlay) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => (playing ? pause() : play());
  const onKey = (e: React.KeyboardEvent) => {
    if (e.code === "Space" || e.key === "k") { e.preventDefault(); toggle(); }
    if (e.key === "ArrowRight") { e.preventDefault(); seek(t + 3); }
    if (e.key === "ArrowLeft") { e.preventDefault(); seek(t - 3); }
    if (e.key === "m") setMuted((m) => !m);
  };

  const active = [...film.chapters].reverse().find((c) => t >= c.t - 0.05) ?? film.chapters[0];
  const vertical = film.aspect === "9/16";

  return (
    <div
      className={cn("group/film outline-none", className)}
      tabIndex={0}
      onKeyDown={onKey}
      aria-label={`Film: ${film.title}. Space to play or pause, arrows to skip.`}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[#f3eee2] ring-1 ring-ink-900/10",
          vertical ? "mx-auto aspect-[9/16] rounded-[2rem]" : "aspect-video rounded-2xl",
          frameClassName,
        )}
      >
        <iframe
          ref={frameRef}
          src={asset.src}
          title={film.title}
          onLoad={onFrameLoad}
          loading="lazy"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
        />
        {/* poster until the drawing engine is ready */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.poster}
          alt=""
          aria-hidden
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", ready ? "opacity-0" : "opacity-100")}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : ended ? "Replay" : "Play with sound"}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className={cn(
              "flex items-center gap-3 rounded-full bg-ink-900/90 px-5 py-3 text-sm font-medium text-paper-50 shadow-lg transition-all duration-300",
              playing ? "pointer-events-none scale-90 opacity-0 group-hover/film:opacity-0" : "opacity-100",
            )}
          >
            <PlayGlyph ended={ended} />
            {ended ? "Watch again" : started ? "Resume" : "Play with sound"}
          </span>
        </button>
      </div>

      <audio
        ref={audioRef}
        preload="auto"
        onError={() => { silentRef.current = true; }}
        onEnded={() => { audioLiveRef.current = false; playingRef.current = false; setPlaying(false); setEnded(true); }}
      />

      {/* controls */}
      <div className={cn("mt-4 flex items-center gap-3", vertical && "mx-auto max-w-[26rem]")}>
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-paper-50 transition-colors hover:bg-brand-700"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <PauseGlyph /> : <PlayGlyph ended={ended} />}
        </button>
        <div className="relative flex-1">
          <input
            type="range"
            min={0}
            max={film.duration}
            step={0.05}
            value={Math.min(t, film.duration)}
            onChange={(e) => seek(parseFloat(e.target.value))}
            aria-label="Seek"
            className="film-range w-full"
            style={{ ["--p" as string]: `${(Math.min(t, film.duration) / film.duration) * 100}%` }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
            {film.chapters.slice(1).map((c) => (
              <span
                key={c.t}
                className="absolute h-2.5 w-px -translate-y-1/2 bg-ink-900/35"
                style={{ left: `${(c.t / film.duration) * 100}%` }}
              />
            ))}
          </div>
        </div>
        <span className="shrink-0 whitespace-nowrap text-right font-mono text-[11px] tabular-nums text-ink-900/55">
          {fmt(t)} / {fmt(film.duration)}
        </span>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="shrink-0 text-ink-900/55 transition-colors hover:text-ink-900"
          aria-label={muted ? "Unmute" : "Mute"}
          title={muted ? "Unmute" : "Mute"}
        >
          <SoundGlyph off={muted} />
        </button>
      </div>

      {!compact && (
        <ol className={cn("mt-4 flex flex-wrap gap-2", vertical && "mx-auto max-w-[26rem]")} aria-label="Chapters">
          {film.chapters.map((c) => (
            <li key={c.t}>
              <button
                type="button"
                onClick={() => (playing ? seek(c.t) : startAt(c.t))}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  active.t === c.t
                    ? "border-ink-900 bg-ink-900 text-paper-50"
                    : "border-ink-900/15 text-ink-900/70 hover:border-ink-900/40 hover:text-ink-900",
                )}
              >
                <span className="mr-1.5 font-mono text-[10px] opacity-60">{fmt(c.t)}</span>
                {c.label}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function PlayGlyph({ ended }: { ended?: boolean }) {
  return ended ? (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2.5 8a5.5 5.5 0 1 0 1.8-4.1M2.5 2.5v3h3" />
    </svg>
  ) : (
    <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden fill="currentColor"><path d="M1 1.2v11.6c0 .6.7 1 1.2.7l9.3-5.8a.8.8 0 0 0 0-1.4L2.2.5C1.7.2 1 .6 1 1.2Z" /></svg>
  );
}
function PauseGlyph() {
  return <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden fill="currentColor"><rect x="1" y="1" width="3.5" height="12" rx="1" /><rect x="7.5" y="1" width="3.5" height="12" rx="1" /></svg>;
}
function SoundGlyph({ off }: { off: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h3l4-3.5v11L6 12H3z" fill="currentColor" stroke="none" />
      {off ? <path d="M13.5 7.5l5 5m0-5l-5 5" /> : <path d="M13.5 7a4 4 0 0 1 0 6M15.8 4.8a7 7 0 0 1 0 10.4" />}
    </svg>
  );
}
