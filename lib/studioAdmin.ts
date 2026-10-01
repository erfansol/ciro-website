import "server-only";
import { Mp3Encoder } from "@breezystack/lamejs";
import { getAdminBucket, getAdminDb } from "./firebaseAdmin";
import { logAdmin } from "./auditLog";
import {
  deriveCardFields,
  describeIssues,
  productionSchema,
  walkSchema,
  type ProductionData,
  type WalkDoc,
} from "./walkSchema";

/**
 * Story Studio — server side of the walk production pipeline:
 * save a walk, draft one with AI, render its narration, track its stage.
 *
 * Environment (server-only, never NEXT_PUBLIC_):
 *   GEMINI_API_KEY        drafting + Gemini TTS
 *   GOOGLE_TTS_API_KEY    Cloud Text-to-Speech voices (optional)
 *   STUDIO_TEXT_MODEL     default gemini-3.1-pro-preview
 *   STUDIO_TTS_MODEL      default gemini-3.8-flash-tts
 */

const TEXT_MODEL = process.env.STUDIO_TEXT_MODEL || "gemini-3.1-pro-preview";
const TTS_MODEL = process.env.STUDIO_TTS_MODEL || "gemini-3.8-flash-tts";
const GEMINI = "https://generativelanguage.googleapis.com/v1beta";

type RawDoc = Record<string, unknown>;

function geminiKey(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new Error("GEMINI_API_KEY is not set on the server.");
  return k;
}

// ── Save ────────────────────────────────────────────────────────────────────

/**
 * Validate and store a walk. Card/map fields the app reads (route, map
 * centre, anchor, start/end labels) are derived from the stops so the
 * document can never disagree with its own walk.
 */
export async function saveWalk(
  id: string,
  input: unknown,
  actorUid: string,
): Promise<WalkDoc> {
  const parsed = walkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Walk is not valid:\n${describeIssues(parsed.error).join("\n")}`);
  }
  const walk = parsed.data;
  const ref = getAdminDb().collection("stories").doc(id);
  const before = await ref.get();
  if (!before.exists) throw new Error(`Story ${id} not found`);

  const update: RawDoc = {
    walk: stripUndefined(walk),
    ...deriveCardFields(walk),
    updatedAt: new Date().toISOString(),
  };
  await ref.update(update);
  await logAdmin({
    actorUid,
    action: "story.update",
    targetCollection: "stories",
    targetId: id,
    before: before.data() as RawDoc,
    after: update,
    reason: "studio: walk saved",
  });
  return walk;
}

export async function saveProduction(
  id: string,
  input: unknown,
  actorUid: string,
): Promise<ProductionData> {
  const parsed = productionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Production data invalid:\n${describeIssues(parsed.error).join("\n")}`);
  }
  const production: ProductionData = { ...parsed.data, updatedAt: new Date().toISOString() };
  const ref = getAdminDb().collection("stories").doc(id);
  const before = await ref.get();
  if (!before.exists) throw new Error(`Story ${id} not found`);
  await ref.update({ production: stripUndefined(production), updatedAt: production.updatedAt });
  await logAdmin({
    actorUid,
    action: "story.update",
    targetCollection: "stories",
    targetId: id,
    before: { production: (before.data() as RawDoc).production ?? null },
    after: { production },
    reason: `studio: stage ${production.stage}`,
  });
  return production;
}

// ── AI draft ────────────────────────────────────────────────────────────────

export type DraftBrief = {
  title: string;
  /** What the walk is about, the dramatic question, who the narrator is. */
  concept: string;
  city: string;
  stops: number;
  language: string;
  /** Free text: "noir, dry humour" / "warm, family-friendly". */
  tone?: string;
  narratorName?: string;
  /** Pasted research, facts, coordinates, sources. The draft must stay inside it. */
  research?: string;
};

export type DraftResult = {
  walk: WalkDoc;
  card: { title: string; description: string; moods: string[]; durationLabel: string };
  model: string;
};

const DRAFT_SYSTEM = `You write narrated walking stories for CIRO, an app that tells the history of a city at the exact spot where it happened. Readers are travellers standing on site with earbuds in.

Every walk follows one structure. Each stop has:
- "findThis": one or two sentences telling the traveller exactly where to stand and what to look at, concrete and visible from the street (a railing, an inscription, the curve of a building). Never "imagine".
- "beat": the narration, 120–250 words, in the narrator's voice, present tense where possible, second person. One vivid, verifiable detail per paragraph. No lectures, no lists, no "as you may know".
- "interaction" (on most stops): a "choice" with 2–3 options each carrying a short in-character "reply"; or a "quiz" with one option marked "correct": true and a reply on every option; or a "reveal" with a "prompt" and an "answer".
- "transition": one or two sentences that hook the traveller into walking to the next stop, ending with where to go.

Rules:
- Only state facts you are sure of or that appear in the research notes. When something is legend, call it legend. Prefer dates, names and numbers you can source. Never invent coordinates: if a coordinate is not in the research, use the best-known coordinate of that landmark.
- Stop ids are lowercase slugs. radiusM between 20 and 40.
- The narrator has a point of view and a voice; keep it consistent. The persona is a style guide (attitude, limits), not a biography.
- The "intro" is 60–120 words that recruits the traveller into the walk. The "ending" closes the story; use type "verdict" with two short uppercase options when the story poses a judgement, otherwise "plain".
- "sources": 3–7 real bibliographic references (author, title, year) that back the walk.
- Also write the card copy: "description" (2–3 sentences for the store listing, no spoilers), "moods" (3–4 one-word tags), "durationLabel" like "≈ 45 min".

Respond with JSON only, no markdown fences, in exactly this shape:
{"card":{"title":"","description":"","moods":[""],"durationLabel":""},"walk":{"language":"en","narrator":{"name":"","persona":""},"intro":{"text":""},"stops":[{"id":"","title":"","place":"","lat":0,"lng":0,"radiusM":25,"findThis":"","beat":{"text":""},"interaction":{"type":"choice","prompt":"","options":[{"label":"","reply":""}]},"transition":{"text":""}}],"ending":{"type":"plain","text":"","prompt":"","options":[]},"askNarrator":true,"maxQuestionsPerStop":3,"sources":[""]}}`;

export async function draftWalk(brief: DraftBrief): Promise<DraftResult> {
  const key = geminiKey();
  const user = [
    `Title: ${brief.title}`,
    `City: ${brief.city}`,
    `Language of the script: ${brief.language}`,
    `Number of stops: ${brief.stops}`,
    brief.narratorName ? `Narrator name: ${brief.narratorName}` : "",
    brief.tone ? `Tone: ${brief.tone}` : "",
    `Concept:\n${brief.concept}`,
    brief.research ? `Research notes (stay inside these for facts and coordinates):\n${brief.research}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = attempt === 0 ? user : `${user}\n\nYour previous draft failed validation:\n${lastError}\nFix every issue and return the full JSON again.`;
    const res = await fetch(`${GEMINI}/models/${TEXT_MODEL}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: DRAFT_SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.8, maxOutputTokens: 16384 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const json = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    let obj: { card?: unknown; walk?: unknown };
    try {
      obj = JSON.parse(stripFences(text));
    } catch {
      lastError = "Response was not valid JSON.";
      continue;
    }
    const parsed = walkSchema.safeParse(obj.walk);
    if (!parsed.success) {
      lastError = describeIssues(parsed.error).join("\n");
      continue;
    }
    const card = (obj.card ?? {}) as Partial<DraftResult["card"]>;
    return {
      walk: parsed.data,
      card: {
        title: typeof card.title === "string" && card.title.trim() ? card.title.trim() : brief.title,
        description: typeof card.description === "string" ? card.description : "",
        moods: Array.isArray(card.moods) ? card.moods.filter((m): m is string => typeof m === "string") : [],
        durationLabel: typeof card.durationLabel === "string" ? card.durationLabel : "",
      },
      model: TEXT_MODEL,
    };
  }
  throw new Error(`The model could not produce a valid walk:\n${lastError}`);
}

function stripFences(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

// ── Narration rendering ─────────────────────────────────────────────────────

export type RenderResult = { rendered: string[]; skipped: number; voice: string };

type Segment = {
  file: string;
  text: string;
  has: () => string | undefined;
  set: (f: string) => void;
};

function segmentsOf(walk: WalkDoc): Segment[] {
  const out: Segment[] = [];
  if (walk.intro) {
    const seg = walk.intro;
    out.push({ file: "intro.mp3", text: seg.text, has: () => seg.audio, set: (f) => (seg.audio = f) });
  }
  walk.stops.forEach((s, i) => {
    const n = String(i + 1).padStart(2, "0");
    out.push({ file: `s${n}_beat.mp3`, text: s.beat.text, has: () => s.beat.audio, set: (f) => (s.beat.audio = f) });
    const t = s.transition;
    if (t && t.text.trim()) {
      out.push({ file: `s${n}_transition.mp3`, text: t.text, has: () => t.audio, set: (f) => (t.audio = f) });
    }
  });
  if (walk.ending) {
    const e = walk.ending;
    out.push({ file: "ending.mp3", text: e.text, has: () => e.audio, set: (f) => (e.audio = f) });
  }
  return out;
}

/** Strips stage directions and markdown so only spoken words are voiced. */
function forSpeech(text: string): string {
  return text.replace(/\[[^\]]*\]/g, "").replace(/[*_#]+/g, "").replace(/\s+/g, " ").trim();
}

function directionFor(walk: WalkDoc): string {
  const n = walk.narrator;
  const who = n.persona ? `You are ${n.name}: ${n.persona}` : `You are ${n.name}.`;
  return (
    `${who}\nPerform the text below as a seasoned, warm professional tour guide speaking ` +
    "to one traveller standing beside you: unhurried, conversational, natural pauses " +
    "between sentences, a hint of dry humour where the text invites it. Never sound " +
    "like an announcer, a newsreader or a text reader. Read only the text; add nothing."
  );
}

/** Raw 16-bit mono PCM samples + rate, from a WAV buffer or bare PCM. */
function pcmFrom(buf: Buffer, mime: string): { samples: Int16Array; rate: number } {
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF") {
    let rate = 24000;
    let offset = 12;
    while (offset + 8 <= buf.length) {
      const id = buf.toString("ascii", offset, offset + 4);
      const size = buf.readUInt32LE(offset + 4);
      if (id === "fmt ") rate = buf.readUInt32LE(offset + 12);
      if (id === "data") {
        const data = buf.subarray(offset + 8, offset + 8 + size);
        return { samples: new Int16Array(data.buffer, data.byteOffset, Math.floor(data.length / 2)), rate };
      }
      offset += 8 + size + (size % 2);
    }
    throw new Error("WAV without a data chunk");
  }
  const rateMatch = /rate=(\d+)/.exec(mime);
  const aligned = buf.length % 2 === 0 ? buf : buf.subarray(0, buf.length - 1);
  return {
    samples: new Int16Array(aligned.buffer, aligned.byteOffset, aligned.length / 2),
    rate: rateMatch ? Number(rateMatch[1]) : 24000,
  };
}

function toMp3(samples: Int16Array, rate: number, kbps = 112): Buffer {
  const enc = new Mp3Encoder(1, rate, kbps);
  const chunks: Uint8Array[] = [];
  const block = 1152 * 8;
  for (let i = 0; i < samples.length; i += block) {
    const part = enc.encodeBuffer(samples.subarray(i, i + block));
    if (part.length) chunks.push(new Uint8Array(part.buffer, part.byteOffset, part.length));
  }
  const tail = enc.flush();
  if (tail.length) chunks.push(new Uint8Array(tail.buffer, tail.byteOffset, tail.length));
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

async function synthesizeGemini(text: string, direction: string, voice: string): Promise<Buffer> {
  const res = await fetch(`${GEMINI}/models/${TTS_MODEL}:generateContent?key=${geminiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${direction}\n\n${text}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data: string } }> } }>;
  };
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part?.inlineData) throw new Error("Gemini TTS returned no audio");
  const { samples, rate } = pcmFrom(Buffer.from(part.inlineData.data, "base64"), part.inlineData.mimeType ?? "");
  return toMp3(samples, rate);
}

async function synthesizeCloud(text: string, voice: string): Promise<Buffer> {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key) throw new Error("GOOGLE_TTS_API_KEY is not set on the server.");
  const locale = /^([a-z]{2,3}-[A-Z]{2})-/.exec(voice);
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: locale ? locale[1] : "en-US", name: voice },
      audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: 24000 },
    }),
  });
  if (!res.ok) throw new Error(`Cloud TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { audioContent: string };
  const { samples, rate } = pcmFrom(Buffer.from(json.audioContent, "base64"), "audio/wav");
  return toMp3(samples, rate);
}

/**
 * Render every un-voiced segment of a story's walk (all of them with
 * `force`), upload to `stories/{id}/` as public MP3s and point the walk
 * at them. The app streams whatever the document names, so no release
 * is needed for a new voice.
 */
export async function renderWalkAudio(
  id: string,
  actorUid: string,
  opts: { force?: boolean } = {},
): Promise<RenderResult> {
  const ref = getAdminDb().collection("stories").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error(`Story ${id} not found`);
  const parsed = walkSchema.safeParse((snap.data() as RawDoc).walk);
  if (!parsed.success) throw new Error("This story has no valid walk to voice.");
  const walk = parsed.data;
  const voice = walk.narrator.voice || "gemini:Charon";
  const gemini = voice.startsWith("gemini:");
  const direction = directionFor(walk);
  const bucket = getAdminBucket();

  const rendered: string[] = [];
  let skipped = 0;
  for (const seg of segmentsOf(walk)) {
    if (seg.has() && !opts.force) {
      skipped += 1;
      continue;
    }
    const text = forSpeech(seg.text);
    if (!text) continue;
    const mp3 = gemini
      ? await synthesizeGemini(text, direction, voice.slice("gemini:".length))
      : await synthesizeCloud(text, voice);
    const remote = bucket.file(`stories/${id}/${seg.file}`);
    await remote.save(mp3, {
      resumable: false,
      metadata: { contentType: "audio/mpeg", cacheControl: "public, max-age=31536000" },
    });
    await remote.makePublic();
    seg.set(seg.file);
    rendered.push(seg.file);
  }

  if (rendered.length > 0) {
    const now = new Date().toISOString();
    await ref.update({ walk: stripUndefined(walk), updatedAt: now });
    await logAdmin({
      actorUid,
      action: "story.update",
      targetCollection: "stories",
      targetId: id,
      after: { rendered, voice, model: gemini ? TTS_MODEL : "cloud-tts" },
      reason: "studio: narration rendered",
    });
  }
  return { rendered, skipped, voice };
}

/** Firestore rejects `undefined`; drop those keys recursively. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripUndefined) as unknown as T;
  if (value && typeof value === "object") {
    const out: RawDoc = {};
    for (const [k, v] of Object.entries(value as RawDoc)) {
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
}
