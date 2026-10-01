import { describe, test, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  deriveCardFields,
  experienceKind,
  walkSchema,
  productionSchema,
} from "@/lib/walkSchema";

// The Walk format lives in three places: this zod schema (Studio editor,
// AI drafter, importer), the Dart model the app plays, and the seeded
// walks in tools/walks/. If the schema drifts from the Dart rules, the
// Studio would happily save a walk the app then drops stops from. These
// tests pin the schema to the shipped content and to the seed script's
// derivation rules.

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const walksDir = path.join(repoRoot, "tools", "walks");

const walkFiles = readdirSync(walksDir).filter((f) => f.endsWith(".json"));

describe("shipped walks", () => {
  test("there are walk files", () => {
    expect(walkFiles.length).toBeGreaterThan(0);
  });

  for (const file of walkFiles) {
    const doc = JSON.parse(readFileSync(path.join(walksDir, file), "utf8"));

    test(`${file} validates with every stop and interaction intact`, () => {
      const parsed = walkSchema.safeParse(doc.walk);
      expect(parsed.success, JSON.stringify(parsed.success ? null : parsed.error.issues)).toBe(true);
      if (!parsed.success) return;
      expect(parsed.data.stops.length).toBe(doc.walk.stops.length);
      doc.walk.stops.forEach((s: { id: string; interaction?: unknown }, i: number) => {
        expect(parsed.data.stops[i].id).toBe(s.id);
        expect(Boolean(parsed.data.stops[i].interaction)).toBe(Boolean(s.interaction));
      });
      expect(experienceKind({ id: doc.id, walk: doc.walk })).toBe("walk");
    });

    test(`${file} derives the same card fields as the seed script`, () => {
      const d = deriveCardFields(walkSchema.parse(doc.walk));
      const stops = doc.walk.stops;
      expect(d.stepsLabel).toBe(`${stops.length} stops`);
      expect(d.routeCoords.length).toBe(stops.length);
      expect(d.anchor.latitude).toBe(stops[0].lat);
      expect(d.anchor.longitude).toBe(stops[0].lng);
      expect(d.mapCenter.lat).toBeGreaterThan(41.8);
      expect(d.mapCenter.lon).toBeGreaterThan(12.4);
    });
  }
});

describe("walkSchema rules mirror the Dart model", () => {
  const stop = (extra: Record<string, unknown> = {}) => ({
    id: "a",
    title: "A",
    lat: 41.9,
    lng: 12.47,
    beat: { text: "Narration." },
    ...extra,
  });

  test("a choice needs two options, a reveal needs an answer, a quiz needs a correct option", () => {
    const base = { narrator: { name: "N" } };
    expect(walkSchema.safeParse({ ...base, stops: [stop({ interaction: { type: "choice", prompt: "?", options: [{ label: "x" }] } })] }).success).toBe(false);
    expect(walkSchema.safeParse({ ...base, stops: [stop({ interaction: { type: "reveal", prompt: "?" } })] }).success).toBe(false);
    expect(walkSchema.safeParse({ ...base, stops: [stop({ interaction: { type: "quiz", prompt: "?", options: [{ label: "x" }, { label: "y" }] } })] }).success).toBe(false);
    expect(walkSchema.safeParse({ ...base, stops: [stop({ interaction: { type: "quiz", prompt: "?", options: [{ label: "x", correct: true }, { label: "y" }] } })] }).success).toBe(true);
  });

  test("duplicate stop ids and a verdict with one option are rejected", () => {
    const base = { narrator: { name: "N" } };
    expect(walkSchema.safeParse({ ...base, stops: [stop(), stop()] }).success).toBe(false);
    expect(walkSchema.safeParse({ ...base, stops: [stop()], ending: { type: "verdict", text: "x", options: ["ONLY"] } }).success).toBe(false);
  });

  test("defaults fill in like the Dart parser", () => {
    const w = walkSchema.parse({ narrator: { name: "N" }, stops: [stop()] });
    expect(w.language).toBe("en");
    expect(w.askNarrator).toBe(true);
    expect(w.maxQuestionsPerStop).toBe(3);
    expect(w.stops[0].radiusM).toBe(25);
  });

  test("experienceKind follows the app's precedence", () => {
    expect(experienceKind({ id: "x" })).toBe("none");
    expect(experienceKind({ id: "x", bundle: { iosUrl: "u" } })).toBe("unity");
    expect(experienceKind({ id: "x", bundle: { iosUrl: "u" }, walk: { stops: [{}] } })).toBe("walk");
    expect(experienceKind({ id: "september-test" })).toBe("flutter");
    expect(experienceKind({ id: "x", filmScene: { videoUrl: "" } })).toBe("film");
  });

  test("production defaults to a fresh draft", () => {
    const p = productionSchema.parse({});
    expect(p.stage).toBe("draft");
    expect(Object.values(p.checklist).every((v) => v === false)).toBe(true);
  });
});
