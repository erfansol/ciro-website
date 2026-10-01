import { z } from "zod";

/**
 * The Walk content format — a narrated, multi-stop story played natively
 * by the Flutter app (`lib/features/walks/domain/walk.dart`). This schema
 * is the single source of truth for the admin Studio editor, the AI
 * drafter and the importer; keep it in step with the Dart model's
 * tolerance rules (a stop needs an id, coordinates and a beat; a choice
 * needs two options; a reveal needs an answer).
 *
 * No server-only imports here: the client editor validates with it too.
 */

export const WALK_INTERACTION_TYPES = ["choice", "reveal", "quiz"] as const;
export const WALK_ENDING_TYPES = ["plain", "verdict"] as const;

const segment = z.object({
  text: z.string().trim().min(1, "Text is required"),
  /** Filename under stories/{id}/. Empty = synthesize on device. */
  audio: z.string().optional(),
});

const option = z.object({
  label: z.string().trim().min(1),
  reply: z.string().optional(),
  correct: z.boolean().optional(),
});

export const walkInteractionSchema = z
  .object({
    type: z.enum(WALK_INTERACTION_TYPES),
    prompt: z.string().trim().min(1, "Interaction prompt is required"),
    options: z.array(option).optional(),
    answer: z.string().optional(),
  })
  .superRefine((it, ctx) => {
    if (it.type === "reveal") {
      if (!it.answer?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A reveal needs an answer" });
      }
      return;
    }
    if (!it.options || it.options.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `A ${it.type} needs at least two options` });
    }
    if (it.type === "quiz" && !(it.options ?? []).some((o) => o.correct)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A quiz needs one correct option" });
    }
  });

export const walkStopSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Stop id is required")
    .regex(/^[a-z0-9-]+$/, "Stop id: lowercase letters, digits and dashes"),
  title: z.string().trim().min(1, "Stop title is required"),
  place: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusM: z.number().min(10).max(200).default(25),
  findThis: z.string().optional(),
  beat: segment,
  image: z
    .object({
      file: z.string().min(1),
      credit: z.string().optional(),
      caption: z.string().optional(),
    })
    .optional(),
  interaction: walkInteractionSchema.optional(),
  transition: segment.optional(),
});

export const walkEndingSchema = z
  .object({
    type: z.enum(WALK_ENDING_TYPES).default("plain"),
    text: z.string().trim().min(1, "Ending text is required"),
    audio: z.string().optional(),
    prompt: z.string().optional(),
    options: z.array(z.string().trim().min(1)).optional(),
  })
  .superRefine((e, ctx) => {
    if (e.type === "verdict" && (!e.options || e.options.length < 2)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A verdict needs at least two options" });
    }
  });

export const walkSchema = z.object({
  language: z.string().default("en"),
  narrator: z.object({
    name: z.string().trim().min(1, "Narrator name is required"),
    persona: z.string().default(""),
    /** `gemini:<Voice>` for Gemini TTS, or a Cloud TTS voice name. */
    voice: z.string().optional(),
  }),
  intro: segment.optional(),
  stops: z
    .array(walkStopSchema)
    .min(1, "A walk needs at least one stop")
    .superRefine((stops, ctx) => {
      const seen = new Set<string>();
      stops.forEach((s, i) => {
        if (seen.has(s.id)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate stop id "${s.id}"`, path: [i, "id"] });
        }
        seen.add(s.id);
      });
    }),
  ending: walkEndingSchema.optional(),
  askNarrator: z.boolean().default(true),
  maxQuestionsPerStop: z.number().int().min(0).max(10).default(3),
  sources: z.array(z.string()).default([]),
});

export type WalkDoc = z.infer<typeof walkSchema>;
export type WalkStop = z.infer<typeof walkStopSchema>;
export type WalkInteraction = z.infer<typeof walkInteractionSchema>;
export type WalkEnding = z.infer<typeof walkEndingSchema>;

// ── Production pipeline ─────────────────────────────────────────────────────

export const PRODUCTION_STAGES = ["draft", "edited", "voiced", "verified", "live"] as const;
export type ProductionStage = (typeof PRODUCTION_STAGES)[number];

export const PRODUCTION_STAGE_LABELS: Record<ProductionStage, string> = {
  draft: "Draft",
  edited: "Edited",
  voiced: "Voiced",
  verified: "Field-verified",
  live: "Live",
};

export const productionSchema = z.object({
  stage: z.enum(PRODUCTION_STAGES).default("draft"),
  checklist: z
    .object({
      script: z.boolean().default(false),
      voice: z.boolean().default(false),
      images: z.boolean().default(false),
      fieldWalk: z.boolean().default(false),
      rights: z.boolean().default(false),
    })
    .default({}),
  notes: z.string().default(""),
  /** Where the script came from. */
  source: z.enum(["human", "ai-assisted", "ai-generated"]).optional(),
  /** Model id used for the last AI draft, if any. */
  draftModel: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ProductionData = z.infer<typeof productionSchema>;

export const PRODUCTION_CHECKLIST: Array<{ key: keyof ProductionData["checklist"]; label: string; hint: string }> = [
  { key: "script", label: "Script edited by a human", hint: "Every beat read, cut and fact-checked against the sources." },
  { key: "voice", label: "Narration rendered", hint: "Audio files exist for the intro, every beat and the ending." },
  { key: "images", label: "Stop images uploaded", hint: "A photo or public-domain image for each stop, with credit." },
  { key: "fieldWalk", label: "Field walk done", hint: "GPS radii, timings and opening hours checked on site." },
  { key: "rights", label: "Rights cleared", hint: "Images and music are owned, public domain, or credited per licence." },
];

// ── Experience kind ─────────────────────────────────────────────────────────

export type ExperienceKind = "walk" | "unity" | "film" | "flutter" | "none";

export const EXPERIENCE_KIND_LABELS: Record<ExperienceKind, string> = {
  walk: "Walk",
  unity: "Unity AR",
  film: "Film scene",
  flutter: "Flutter scene",
  none: "No experience",
};

/** Story ids that the app maps to a purpose-built Flutter screen. */
export const FLUTTER_NATIVE_STORY_IDS = new Set(["september-test"]);

/**
 * How a story plays, derived from what the document carries — the same
 * precedence the Flutter app uses (walk → native screen → Unity bundle).
 */
export function experienceKind(doc: {
  id: string;
  walk?: unknown;
  bundle?: { iosUrl?: string; androidUrl?: string } | null;
  filmScene?: unknown;
}): ExperienceKind {
  const walk = doc.walk as { stops?: unknown[] } | undefined;
  if (walk && Array.isArray(walk.stops) && walk.stops.length > 0) return "walk";
  if (FLUTTER_NATIVE_STORY_IDS.has(doc.id)) return "flutter";
  if (doc.bundle?.iosUrl || doc.bundle?.androidUrl) return "unity";
  if (doc.filmScene && typeof doc.filmScene === "object") return "film";
  return "none";
}

// ── Voices ──────────────────────────────────────────────────────────────────

/** Gemini TTS prebuilt voices that suit narration (name → character). */
export const GEMINI_VOICES: ReadonlyArray<{ id: string; label: string }> = [
  { id: "gemini:Charon", label: "Charon — deep, calm (male)" },
  { id: "gemini:Algenib", label: "Algenib — gravelly, older (male)" },
  { id: "gemini:Enceladus", label: "Enceladus — breathy, intimate (male)" },
  { id: "gemini:Orus", label: "Orus — firm, confident (male)" },
  { id: "gemini:Puck", label: "Puck — upbeat (male)" },
  { id: "gemini:Kore", label: "Kore — firm, warm (female)" },
  { id: "gemini:Aoede", label: "Aoede — breezy (female)" },
  { id: "gemini:Leda", label: "Leda — youthful (female)" },
  { id: "gemini:Sulafat", label: "Sulafat — warm (female)" },
  { id: "gemini:Zephyr", label: "Zephyr — bright (female)" },
];

export const CLOUD_VOICES: ReadonlyArray<{ id: string; label: string }> = [
  { id: "en-US-Chirp3-HD-Charon", label: "Chirp 3 HD Charon (US male)" },
  { id: "en-US-Chirp3-HD-Algenib", label: "Chirp 3 HD Algenib (US male)" },
  { id: "en-GB-Chirp3-HD-Charon", label: "Chirp 3 HD Charon (British male)" },
  { id: "en-US-Chirp3-HD-Kore", label: "Chirp 3 HD Kore (US female)" },
  { id: "en-GB-Chirp3-HD-Kore", label: "Chirp 3 HD Kore (British female)" },
  { id: "en-US-Studio-Q", label: "Studio Q (US male, legacy)" },
  { id: "en-US-Studio-O", label: "Studio O (US female, legacy)" },
  { id: "en-GB-Studio-B", label: "Studio B (British male, legacy)" },
];

export const DEFAULT_VOICE = "gemini:Charon";

export function emptyWalk(): WalkDoc {
  return {
    language: "en",
    narrator: { name: "", persona: "", voice: DEFAULT_VOICE },
    intro: undefined,
    stops: [],
    ending: undefined,
    askNarrator: true,
    maxQuestionsPerStop: 3,
    sources: [],
  };
}

export function emptyStop(index: number): WalkStop {
  return {
    id: `stop-${index + 1}`,
    title: "",
    place: "",
    lat: 41.9028,
    lng: 12.4964,
    radiusM: 25,
    findThis: "",
    beat: { text: "" },
    transition: undefined,
  };
}

/** Human-readable summary of zod issues for the editor's error banner. */
export function describeIssues(error: z.ZodError): string[] {
  return error.issues.map((i) => {
    const where = i.path.length ? `${i.path.map(String).join(".")}: ` : "";
    return `${where}${i.message}`;
  });
}

/**
 * Card/map fields the app reads, derived from the stops — the same rule
 * `tools/seed_walks.js` applies, so a walk edited in the Studio and one
 * seeded from the CLI look identical.
 */
export function deriveCardFields(walk: WalkDoc) {
  const stops = walk.stops;
  const first = stops[0];
  const last = stops[stops.length - 1];
  const lats = stops.map((s) => s.lat);
  const lngs = stops.map((s) => s.lng);
  const place = (s: WalkStop) => (s.place ? s.place.split(",")[0].trim() : s.title);
  return {
    stepsLabel: `${stops.length} stops`,
    startLabel: place(first),
    endLabel: place(last),
    mapCenter: {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lon: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    },
    routeCoords: stops.map((s) => ({ lat: s.lat, lon: s.lng, label: s.title })),
    anchor: {
      latitude: first.lat,
      longitude: first.lng,
      triggerRadiusM: 250,
      spawnAtUser: false,
    },
  };
}
