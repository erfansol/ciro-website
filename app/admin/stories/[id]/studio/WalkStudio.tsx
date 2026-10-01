"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GoogleMap, Marker, Polyline, useLoadScript } from "@react-google-maps/api";
import type { AdminStory } from "@/lib/storyAdmin";
import type { DraftBrief, DraftResult } from "@/lib/studioAdmin";
import {
  CLOUD_VOICES,
  GEMINI_VOICES,
  PRODUCTION_CHECKLIST,
  PRODUCTION_STAGES,
  PRODUCTION_STAGE_LABELS,
  WALK_INTERACTION_TYPES,
  describeIssues,
  emptyStop,
  emptyWalk,
  walkSchema,
  type ProductionData,
  type WalkDoc,
  type WalkInteraction,
  type WalkStop,
} from "@/lib/walkSchema";
import { buildMapOptions } from "../../../world/AdminWorldMap";
import {
  applyDraftAction,
  draftWalkAction,
  renderAudioAction,
  saveProductionAction,
  saveWalkAction,
} from "./actions";

const INPUT =
  "mt-1.5 w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus:border-admin-border-strong focus:outline-none";
const TEXTAREA = `${INPUT} leading-relaxed`;
const BTN =
  "rounded-md border border-admin-border-strong bg-admin-surface px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-admin-text-muted transition-colors hover:text-admin-text disabled:opacity-50";
const BTN_PRIMARY =
  "rounded-md bg-admin-accent px-4 py-2 text-sm font-medium text-admin-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50";

type Notice = { kind: "ok" | "error" | "info"; text: string } | null;

export function WalkStudio({
  story,
  apiKey,
  theme,
  bucketName,
  aiConfigured,
}: {
  story: AdminStory;
  apiKey: string;
  theme: "dark" | "light";
  bucketName: string;
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [walk, setWalk] = useState<WalkDoc>(() => story.walk ?? emptyWalk());
  const [selected, setSelected] = useState<number>(0);
  const [production, setProduction] = useState<ProductionData>(story.production);
  const [notice, setNotice] = useState<Notice>(
    story.walkIssues.length
      ? { kind: "error", text: `The stored walk has problems:\n${story.walkIssues.join("\n")}` }
      : null,
  );
  const [issues, setIssues] = useState<string[]>([]);
  const [draftOpen, setDraftOpen] = useState<boolean>(!story.walk);
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [brief, setBrief] = useState<DraftBrief>({
    title: story.title,
    concept: story.description,
    city: story.city,
    stops: 5,
    language: "en",
    tone: "",
    narratorName: "",
    research: "",
  });

  const stop: WalkStop | undefined = walk.stops[selected];

  const update = useCallback((fn: (w: WalkDoc) => WalkDoc) => {
    setWalk((w) => fn(w));
  }, []);

  const updateStop = useCallback(
    (index: number, fn: (s: WalkStop) => WalkStop) => {
      setWalk((w) => ({
        ...w,
        stops: w.stops.map((s, i) => (i === index ? fn(s) : s)),
      }));
    },
    [],
  );

  // ── Validation ────────────────────────────────────────────────────────

  function validate(): WalkDoc | null {
    const parsed = walkSchema.safeParse(walk);
    if (!parsed.success) {
      const list = describeIssues(parsed.error);
      setIssues(list);
      setNotice({ kind: "error", text: `${list.length} problem${list.length === 1 ? "" : "s"} to fix before saving.` });
      return null;
    }
    setIssues([]);
    return parsed.data;
  }

  // ── Actions ───────────────────────────────────────────────────────────

  function onSave() {
    const valid = validate();
    if (!valid) return;
    startTransition(async () => {
      const res = await saveWalkAction(story.id, valid);
      if (res.ok) {
        setWalk(res.value);
        setNotice({ kind: "ok", text: `Walk saved · ${new Date().toLocaleTimeString()}` });
        router.refresh();
      } else {
        setNotice({ kind: "error", text: res.error });
      }
    });
  }

  function onSaveProduction(next: ProductionData) {
    setProduction(next);
    startTransition(async () => {
      const res = await saveProductionAction(story.id, next);
      if (!res.ok) setNotice({ kind: "error", text: res.error });
    });
  }

  function onRender(force: boolean) {
    if (
      force &&
      !confirm("Re-render every segment with the current voice? Existing audio files are replaced.")
    ) {
      return;
    }
    setNotice({ kind: "info", text: "Rendering narration… this takes about a minute per walk." });
    startTransition(async () => {
      const res = await renderAudioAction(story.id, force);
      if (res.ok) {
        const { rendered, skipped, voice } = res.value;
        setNotice({
          kind: "ok",
          text: rendered.length
            ? `Rendered ${rendered.length} file${rendered.length === 1 ? "" : "s"} with ${voice} (${skipped} already had audio). Reloading…`
            : `Nothing to render — every segment already has audio (${skipped}). Use "Re-render all" to replace them.`,
        });
        if (rendered.length) router.refresh();
      } else {
        setNotice({ kind: "error", text: res.error });
      }
    });
  }

  function onDraft() {
    setNotice({ kind: "info", text: "Drafting… a full walk takes 30–90 seconds." });
    setDraft(null);
    startTransition(async () => {
      const res = await draftWalkAction(brief);
      if (res.ok) {
        setDraft(res.value);
        setNotice({ kind: "ok", text: `Draft ready: ${res.value.walk.stops.length} stops from ${res.value.model}. Review it below, then apply or discard.` });
      } else {
        setNotice({ kind: "error", text: res.error });
      }
    });
  }

  function onApplyDraft() {
    if (!draft) return;
    if (
      story.walk &&
      !confirm("Replace the current walk and the card copy with this draft? The audit log keeps the previous version.")
    ) {
      return;
    }
    startTransition(async () => {
      const res = await applyDraftAction(story.id, draft);
      if (res.ok) {
        setWalk(res.value);
        setSelected(0);
        setDraft(null);
        setDraftOpen(false);
        setProduction((p) => ({ ...p, stage: "draft", source: "ai-generated", draftModel: draft.model }));
        setNotice({ kind: "ok", text: "Draft applied. Now edit every beat — that is where the quality comes from." });
        router.refresh();
      } else {
        setNotice({ kind: "error", text: res.error });
      }
    });
  }

  // ── Stops ─────────────────────────────────────────────────────────────

  function addStop() {
    update((w) => {
      const next = emptyStop(w.stops.length);
      const last = w.stops[w.stops.length - 1];
      if (last) {
        next.lat = last.lat + 0.0008;
        next.lng = last.lng + 0.0008;
      }
      return { ...w, stops: [...w.stops, next] };
    });
    setSelected(walk.stops.length);
  }

  function removeStop(index: number) {
    if (!confirm(`Remove stop ${index + 1}?`)) return;
    update((w) => ({ ...w, stops: w.stops.filter((_, i) => i !== index) }));
    setSelected((s) => Math.max(0, Math.min(s, walk.stops.length - 2)));
  }

  function moveStop(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= walk.stops.length) return;
    update((w) => {
      const stops = [...w.stops];
      [stops[index], stops[target]] = [stops[target], stops[index]];
      return { ...w, stops };
    });
    setSelected(target);
  }

  const audioUrl = (file?: string) =>
    file ? `https://storage.googleapis.com/${bucketName}/stories/${story.id}/${encodeURIComponent(file)}` : null;

  const voiced = useMemo(() => {
    let total = 0;
    let done = 0;
    const count = (seg?: { text: string; audio?: string }) => {
      if (!seg || !seg.text.trim()) return;
      total += 1;
      if (seg.audio) done += 1;
    };
    count(walk.intro);
    walk.stops.forEach((s) => {
      count(s.beat);
      count(s.transition);
    });
    count(walk.ending ? { text: walk.ending.text, audio: walk.ending.audio } : undefined);
    return { total, done };
  }, [walk]);

  return (
    <div className="space-y-6">
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-admin-border bg-admin-surface-strong/40 px-4 py-3">
        <button type="button" onClick={onSave} disabled={pending} className={BTN_PRIMARY}>
          {pending ? "Working…" : "Save walk"}
        </button>
        <button type="button" onClick={validate} disabled={pending} className={BTN}>
          Validate
        </button>
        <span className="mx-1 h-5 w-px bg-admin-border" />
        <button type="button" onClick={() => onRender(false)} disabled={pending} className={BTN} title="Voice segments that have no audio yet">
          Render voice ({voiced.done}/{voiced.total})
        </button>
        <button type="button" onClick={() => onRender(true)} disabled={pending} className={BTN}>
          Re-render all
        </button>
        <span className="mx-1 h-5 w-px bg-admin-border" />
        <button type="button" onClick={() => setDraftOpen((o) => !o)} disabled={pending} className={BTN}>
          {draftOpen ? "Hide AI draft" : "Draft with AI"}
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs text-admin-text-subtle">
          <span>Stage</span>
          <select
            value={production.stage}
            onChange={(e) => onSaveProduction({ ...production, stage: e.target.value as ProductionData["stage"] })}
            className="rounded-md border border-admin-border bg-admin-surface px-2 py-1 text-xs text-admin-text"
          >
            {PRODUCTION_STAGES.map((s) => (
              <option key={s} value={s}>
                {PRODUCTION_STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {notice && (
        <div
          className={`whitespace-pre-wrap rounded-md border px-4 py-3 text-sm ${
            notice.kind === "error"
              ? "border-red-400/30 bg-red-400/[0.06] text-red-200"
              : notice.kind === "ok"
                ? "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-200"
                : "border-admin-border bg-admin-surface text-admin-text-muted"
          }`}
        >
          {notice.text}
          {issues.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── AI draft panel ──────────────────────────────────────────── */}
      {draftOpen && (
        <section className="rounded-md border border-admin-border bg-admin-surface-strong/40 p-5">
          <h2 className="font-display text-lg text-admin-text">Draft with AI</h2>
          <p className="mt-1 text-xs text-admin-text-subtle">
            Give it the brief; it returns a complete walk in the CIRO structure (find-this, beat, interaction, transition per stop) plus card copy. A draft is a starting point — every beat still gets a human edit and a field walk.
            {!aiConfigured && " GEMINI_API_KEY is not set on this server, so drafting is disabled."}
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <L label="Title">
                <input className={INPUT} value={brief.title} onChange={(e) => setBrief({ ...brief, title: e.target.value })} />
              </L>
              <L label="Concept — what happens, the dramatic question, who tells it">
                <textarea className={TEXTAREA} rows={6} value={brief.concept} onChange={(e) => setBrief({ ...brief, concept: e.target.value })} />
              </L>
              <div className="grid grid-cols-3 gap-3">
                <L label="City">
                  <input className={INPUT} value={brief.city} onChange={(e) => setBrief({ ...brief, city: e.target.value })} />
                </L>
                <L label="Stops">
                  <input className={INPUT} type="number" min={3} max={8} value={brief.stops} onChange={(e) => setBrief({ ...brief, stops: Number(e.target.value) })} />
                </L>
                <L label="Language">
                  <input className={INPUT} value={brief.language} onChange={(e) => setBrief({ ...brief, language: e.target.value })} />
                </L>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <L label="Narrator name (optional)">
                  <input className={INPUT} value={brief.narratorName ?? ""} onChange={(e) => setBrief({ ...brief, narratorName: e.target.value })} />
                </L>
                <L label="Tone (optional)">
                  <input className={INPUT} placeholder="noir, dry humour" value={brief.tone ?? ""} onChange={(e) => setBrief({ ...brief, tone: e.target.value })} />
                </L>
              </div>
            </div>
            <div className="space-y-3">
              <L label="Research notes — facts, dates, coordinates, sources (the draft stays inside these)">
                <textarea className={`${TEXTAREA} font-mono text-[12px]`} rows={14} value={brief.research ?? ""} onChange={(e) => setBrief({ ...brief, research: e.target.value })} />
              </L>
              <div className="flex items-center gap-3">
                <button type="button" onClick={onDraft} disabled={pending || !aiConfigured} className={BTN_PRIMARY}>
                  Generate draft
                </button>
                {draft && (
                  <>
                    <button type="button" onClick={onApplyDraft} disabled={pending} className={BTN}>
                      Use this draft
                    </button>
                    <button type="button" onClick={() => setDraft(null)} disabled={pending} className={BTN}>
                      Discard
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          {draft && (
            <div className="mt-4 rounded-md border border-admin-border bg-admin-surface p-4 text-sm text-admin-text">
              <p className="font-display text-base">{draft.card.title}</p>
              <p className="mt-1 text-xs text-admin-text-muted">{draft.card.description}</p>
              <p className="mt-2 text-xs text-admin-text-subtle">
                Narrator: {draft.walk.narrator.name} · {draft.walk.stops.length} stops · {draft.card.durationLabel} · {draft.card.moods.join(", ")}
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs">
                {draft.walk.stops.map((s) => (
                  <li key={s.id}>
                    <span className="text-admin-text">{s.title}</span>
                    <span className="text-admin-text-subtle"> — {s.place} · {s.beat.text.split(/\s+/).length} words{s.interaction ? ` · ${s.interaction.type}` : ""}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* ── Left: narrator, intro, ending, sources, production ────── */}
        <div className="space-y-5">
          <Section title="Narrator">
            <L label="Name">
              <input className={INPUT} value={walk.narrator.name} onChange={(e) => update((w) => ({ ...w, narrator: { ...w.narrator, name: e.target.value } }))} />
            </L>
            <L label="Persona — attitude, limits, how they talk (also the AI's acting note)">
              <textarea className={TEXTAREA} rows={5} value={walk.narrator.persona} onChange={(e) => update((w) => ({ ...w, narrator: { ...w.narrator, persona: e.target.value } }))} />
            </L>
            <L label="Voice">
              <select
                className={INPUT}
                value={walk.narrator.voice ?? ""}
                onChange={(e) => update((w) => ({ ...w, narrator: { ...w.narrator, voice: e.target.value || undefined } }))}
              >
                <optgroup label="Gemini TTS — directed by the persona">
                  {GEMINI_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Cloud Text-to-Speech">
                  {CLOUD_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </optgroup>
              </select>
            </L>
            <div className="grid grid-cols-2 gap-3">
              <L label="Script language">
                <input className={INPUT} value={walk.language} onChange={(e) => update((w) => ({ ...w, language: e.target.value }))} />
              </L>
              <L label="Questions per stop">
                <input className={INPUT} type="number" min={0} max={10} value={walk.maxQuestionsPerStop} onChange={(e) => update((w) => ({ ...w, maxQuestionsPerStop: Number(e.target.value) }))} />
              </L>
            </div>
            <label className="flex items-center gap-2 text-xs text-admin-text-muted">
              <input type="checkbox" className="accent-admin-accent" checked={walk.askNarrator} onChange={(e) => update((w) => ({ ...w, askNarrator: e.target.checked }))} />
              Let travellers ask the narrator questions
            </label>
          </Section>

          <Section title="Intro" hint={audioBadge(walk.intro?.audio, audioUrl)}>
            <textarea className={TEXTAREA} rows={6} placeholder="60–120 words that recruit the traveller into the walk." value={walk.intro?.text ?? ""} onChange={(e) => update((w) => ({ ...w, intro: e.target.value.trim() ? { ...(w.intro ?? {}), text: e.target.value } : undefined }))} />
          </Section>

          <Section title="Ending" hint={audioBadge(walk.ending?.audio, audioUrl)}>
            <div className="grid grid-cols-2 gap-3">
              <L label="Type">
                <select className={INPUT} value={walk.ending?.type ?? "plain"} onChange={(e) => update((w) => ({ ...w, ending: { ...(w.ending ?? { text: "" }), type: e.target.value as "plain" | "verdict" } }))}>
                  <option value="plain">Closing narration</option>
                  <option value="verdict">Verdict — the traveller judges</option>
                </select>
              </L>
              {walk.ending?.type === "verdict" && (
                <L label="Options (one per line)">
                  <textarea className={TEXTAREA} rows={2} value={(walk.ending?.options ?? []).join("\n")} onChange={(e) => update((w) => ({ ...w, ending: { ...(w.ending ?? { type: "verdict", text: "" }), options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) } }))} />
                </L>
              )}
            </div>
            {walk.ending?.type === "verdict" && (
              <L label="Question put to the traveller">
                <input className={INPUT} value={walk.ending?.prompt ?? ""} onChange={(e) => update((w) => ({ ...w, ending: { ...(w.ending ?? { type: "verdict", text: "" }), prompt: e.target.value } }))} />
              </L>
            )}
            <L label="Closing text">
              <textarea className={TEXTAREA} rows={5} value={walk.ending?.text ?? ""} onChange={(e) => update((w) => ({ ...w, ending: e.target.value.trim() || w.ending?.type === "verdict" ? { ...(w.ending ?? { type: "plain" }), text: e.target.value } : undefined }))} />
            </L>
          </Section>

          <Section title="Sources" hint={<span className="text-xs text-admin-text-subtle">one per line · shown to travellers</span>}>
            <textarea className={`${TEXTAREA} font-mono text-[12px]`} rows={6} value={walk.sources.join("\n")} onChange={(e) => update((w) => ({ ...w, sources: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))} />
          </Section>

          <Section title="Production">
            <ul className="space-y-2">
              {PRODUCTION_CHECKLIST.map((item) => (
                <li key={item.key}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 accent-admin-accent"
                      checked={production.checklist[item.key]}
                      onChange={(e) => onSaveProduction({ ...production, checklist: { ...production.checklist, [item.key]: e.target.checked } })}
                    />
                    <span>
                      <span className="block text-sm text-admin-text">{item.label}</span>
                      <span className="block text-xs text-admin-text-subtle">{item.hint}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <L label="Notes for the team">
              <textarea className={TEXTAREA} rows={4} value={production.notes} onChange={(e) => setProduction({ ...production, notes: e.target.value })} onBlur={() => onSaveProduction(production)} />
            </L>
            {production.source && (
              <p className="text-xs text-admin-text-subtle">
                Script source: {production.source}{production.draftModel ? ` (${production.draftModel})` : ""}
              </p>
            )}
          </Section>
        </div>

        {/* ── Right: map + stops ─────────────────────────────────────── */}
        <div className="space-y-5">
          <StopsMap apiKey={apiKey} theme={theme} stops={walk.stops} selected={selected} onSelect={setSelected} onMove={(i, lat, lng) => updateStop(i, (s) => ({ ...s, lat: round6(lat), lng: round6(lng) }))} />

          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <Section title={`Stops (${walk.stops.length})`} hint={<button type="button" onClick={addStop} className={BTN}>+ Add</button>}>
              {walk.stops.length === 0 ? (
                <p className="text-xs text-admin-text-subtle">No stops yet. Add one, or draft the whole walk with AI.</p>
              ) : (
                <ol className="space-y-1">
                  {walk.stops.map((s, i) => (
                    <li key={`${s.id}-${i}`}>
                      <button
                        type="button"
                        onClick={() => setSelected(i)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${i === selected ? "bg-admin-accent/15 text-admin-text" : "text-admin-text-muted hover:bg-admin-surface"}`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-admin-surface text-[10px] font-semibold text-admin-text">{i + 1}</span>
                        <span className="truncate">{s.title || <em className="text-admin-text-subtle">untitled</em>}</span>
                        {s.beat.audio && <span className="ml-auto text-[10px] text-emerald-300" title="voiced">♪</span>}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </Section>

            {stop ? (
              <Section
                title={`Stop ${selected + 1}`}
                hint={
                  <span className="flex items-center gap-1">
                    <button type="button" onClick={() => moveStop(selected, -1)} className={BTN} title="Move up">↑</button>
                    <button type="button" onClick={() => moveStop(selected, 1)} className={BTN} title="Move down">↓</button>
                    <button type="button" onClick={() => removeStop(selected)} className={`${BTN} text-red-300`}>Remove</button>
                  </span>
                }
              >
                <div className="grid grid-cols-[1fr_2fr] gap-3">
                  <L label="Id (slug)">
                    <input className={INPUT} value={stop.id} onChange={(e) => updateStop(selected, (s) => ({ ...s, id: e.target.value }))} />
                  </L>
                  <L label="Title">
                    <input className={INPUT} value={stop.title} onChange={(e) => updateStop(selected, (s) => ({ ...s, title: e.target.value }))} />
                  </L>
                </div>
                <L label="Place — where to stand, as a traveller would read it">
                  <input className={INPUT} value={stop.place ?? ""} onChange={(e) => updateStop(selected, (s) => ({ ...s, place: e.target.value }))} />
                </L>
                <div className="grid grid-cols-3 gap-3">
                  <L label="Latitude">
                    <input className={INPUT} type="number" step="0.000001" value={stop.lat} onChange={(e) => updateStop(selected, (s) => ({ ...s, lat: Number(e.target.value) }))} />
                  </L>
                  <L label="Longitude">
                    <input className={INPUT} type="number" step="0.000001" value={stop.lng} onChange={(e) => updateStop(selected, (s) => ({ ...s, lng: Number(e.target.value) }))} />
                  </L>
                  <L label="Arrival radius (m)">
                    <input className={INPUT} type="number" min={10} max={200} value={stop.radiusM} onChange={(e) => updateStop(selected, (s) => ({ ...s, radiusM: Number(e.target.value) }))} />
                  </L>
                </div>
                <p className="text-[11px] text-admin-text-subtle">Click the map to place this stop, or drag its marker.</p>
                <L label="Find this — what to look at, visible from the street">
                  <textarea className={TEXTAREA} rows={3} value={stop.findThis ?? ""} onChange={(e) => updateStop(selected, (s) => ({ ...s, findThis: e.target.value }))} />
                </L>
                <L label={<span>The beat — narration, 120–250 words <WordCount text={stop.beat.text} /> {audioBadge(stop.beat.audio, audioUrl)}</span>}>
                  <textarea className={TEXTAREA} rows={9} value={stop.beat.text} onChange={(e) => updateStop(selected, (s) => ({ ...s, beat: { ...s.beat, text: e.target.value } }))} />
                </L>

                <InteractionEditor
                  value={stop.interaction}
                  onChange={(it) => updateStop(selected, (s) => ({ ...s, interaction: it }))}
                />

                <L label={<span>Transition — the hook into the next stop {audioBadge(stop.transition?.audio, audioUrl)}</span>}>
                  <textarea className={TEXTAREA} rows={2} value={stop.transition?.text ?? ""} onChange={(e) => updateStop(selected, (s) => ({ ...s, transition: e.target.value.trim() ? { ...(s.transition ?? {}), text: e.target.value } : undefined }))} />
                </L>
                <div className="grid grid-cols-2 gap-3">
                  <L label="Image file (uploaded under Media)">
                    <input className={INPUT} placeholder="s1_stadium.jpg" value={stop.image?.file ?? ""} onChange={(e) => updateStop(selected, (s) => ({ ...s, image: e.target.value.trim() ? { ...(s.image ?? {}), file: e.target.value.trim() } : undefined }))} />
                  </L>
                  <L label="Image credit">
                    <input className={INPUT} value={stop.image?.credit ?? ""} disabled={!stop.image} onChange={(e) => updateStop(selected, (s) => (s.image ? { ...s, image: { ...s.image, credit: e.target.value } } : s))} />
                  </L>
                </div>
              </Section>
            ) : (
              <Section title="Stop">
                <p className="text-xs text-admin-text-subtle">Select a stop on the left.</p>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Interaction editor ───────────────────────────────────────────────────────

function InteractionEditor({
  value,
  onChange,
}: {
  value: WalkInteraction | undefined;
  onChange: (it: WalkInteraction | undefined) => void;
}) {
  const type = value?.type ?? "none";
  function setType(next: string) {
    if (next === "none") return onChange(undefined);
    const t = next as WalkInteraction["type"];
    if (t === "reveal") return onChange({ type: t, prompt: value?.prompt ?? "", answer: value?.answer ?? "" });
    const options = value?.options?.length ? value.options : [{ label: "", reply: "" }, { label: "", reply: "" }];
    onChange({ type: t, prompt: value?.prompt ?? "", options });
  }
  return (
    <div className="rounded-md border border-admin-border bg-admin-surface-strong/30 p-3">
      <div className="grid grid-cols-[160px_1fr] gap-3">
        <L label="Interaction">
          <select className={INPUT} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="none">None</option>
            {WALK_INTERACTION_TYPES.map((t) => (
              <option key={t} value={t}>{t === "choice" ? "Choice" : t === "quiz" ? "Quiz" : "Reveal"}</option>
            ))}
          </select>
        </L>
        {value && (
          <L label="Prompt">
            <input className={INPUT} value={value.prompt} onChange={(e) => onChange({ ...value, prompt: e.target.value })} />
          </L>
        )}
      </div>
      {value?.type === "reveal" && (
        <L label="Answer (shown when tapped)">
          <textarea className={TEXTAREA} rows={3} value={value.answer ?? ""} onChange={(e) => onChange({ ...value, answer: e.target.value })} />
        </L>
      )}
      {value && value.type !== "reveal" && (
        <div className="mt-3 space-y-2">
          {(value.options ?? []).map((o, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto_auto] items-end gap-2">
              <L label={i === 0 ? "Option" : undefined}>
                <input className={INPUT} value={o.label} onChange={(e) => onChange({ ...value, options: value.options!.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
              </L>
              <L label={i === 0 ? "Narrator's reply" : undefined}>
                <input className={INPUT} value={o.reply ?? ""} onChange={(e) => onChange({ ...value, options: value.options!.map((x, j) => (j === i ? { ...x, reply: e.target.value } : x)) })} />
              </L>
              {value.type === "quiz" ? (
                <label className="mb-2 flex items-center gap-1 text-[11px] text-admin-text-muted" title="Correct answer">
                  <input type="radio" name="correct" className="accent-admin-accent" checked={Boolean(o.correct)} onChange={() => onChange({ ...value, options: value.options!.map((x, j) => ({ ...x, correct: j === i })) })} />
                  ✓
                </label>
              ) : (
                <span />
              )}
              <button type="button" className={`${BTN} mb-1.5`} onClick={() => onChange({ ...value, options: value.options!.filter((_, j) => j !== i) })} title="Remove option">×</button>
            </div>
          ))}
          <button type="button" className={BTN} onClick={() => onChange({ ...value, options: [...(value.options ?? []), { label: "", reply: "" }] })}>+ Option</button>
        </div>
      )}
    </div>
  );
}

// ── Map ──────────────────────────────────────────────────────────────────────

function StopsMap({
  apiKey,
  theme,
  stops,
  selected,
  onSelect,
  onMove,
}: {
  apiKey: string;
  theme: "dark" | "light";
  stops: WalkStop[];
  selected: number;
  onSelect: (i: number) => void;
  onMove: (i: number, lat: number, lng: number) => void;
}) {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: apiKey });
  const options = useMemo(() => buildMapOptions(theme), [theme]);
  const center = useMemo(() => {
    const s = stops[selected] ?? stops[0];
    return s ? { lat: s.lat, lng: s.lng } : { lat: 41.9028, lng: 12.4964 };
  }, [stops, selected]);

  if (!apiKey) {
    return <div className="rounded-md border border-admin-border bg-admin-surface p-4 text-xs text-admin-text-subtle">Set NEXT_PUBLIC_GOOGLE_MAPS_KEY to place stops on a map.</div>;
  }
  if (loadError) {
    return <div className="rounded-md border border-red-400/30 bg-red-400/[0.06] p-4 text-xs text-red-200">Google Maps failed to load.</div>;
  }
  if (!isLoaded) {
    return <div className="h-[380px] animate-pulse rounded-md border border-admin-border bg-admin-surface" />;
  }
  return (
    <div className="overflow-hidden rounded-md border border-admin-border">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: 380 }}
        center={center}
        zoom={16}
        options={options}
        onClick={(e) => {
          if (e.latLng && stops[selected]) onMove(selected, e.latLng.lat(), e.latLng.lng());
        }}
      >
        {stops.length > 1 && (
          <Polyline path={stops.map((s) => ({ lat: s.lat, lng: s.lng }))} options={{ strokeColor: "#e0ad4a", strokeOpacity: 0.8, strokeWeight: 3 }} />
        )}
        {stops.map((s, i) => (
          <Marker
            key={`${s.id}-${i}`}
            position={{ lat: s.lat, lng: s.lng }}
            label={{ text: String(i + 1), color: "#111", fontWeight: "700", fontSize: "12px" }}
            draggable
            opacity={i === selected ? 1 : 0.7}
            onClick={() => onSelect(i)}
            onDragEnd={(e) => {
              if (e.latLng) onMove(i, e.latLng.lat(), e.latLng.lng());
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}

// ── Small pieces ─────────────────────────────────────────────────────────────

function Section({ title, hint, children }: { title: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-md border border-admin-border bg-admin-surface-strong/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base text-admin-text">{title}</h2>
        {hint}
      </div>
      {children}
    </section>
  );
}

function L({ label, children }: { label?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      {label !== undefined && (
        <label className="block text-[11px] uppercase tracking-[0.18em] text-admin-text-subtle">{label}</label>
      )}
      {children}
    </div>
  );
}

function WordCount({ text }: { text: string }) {
  const n = text.trim() ? text.trim().split(/\s+/).length : 0;
  const bad = n > 0 && (n < 80 || n > 320);
  return <span className={`normal-case tracking-normal ${bad ? "text-amber-300" : "text-admin-text-subtle"}`}>· {n} words</span>;
}

function audioBadge(file: string | undefined, url: (f?: string) => string | null) {
  if (!file) return <span className="text-[10px] uppercase tracking-[0.18em] text-admin-text-faint">no audio · device voice</span>;
  const href = url(file);
  return (
    <a href={href ?? "#"} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.18em] text-emerald-300 hover:underline">
      ♪ {file}
    </a>
  );
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}
