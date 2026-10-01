import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { CATEGORIES, CATEGORY_BY_ID } from "@/lib/categories";
import { CITIES, getCityBySlug, liveCities, upcomingCities } from "@/lib/cities";

// The story taxonomy is declared three times over — the Flutter enum, this
// site's CATEGORIES table, and the Firestore rules' report/report-reason
// lists. Nothing links them at build time, so a sixth category added to one
// surface silently breaks filtering on the others: the app writes a
// `category` the site maps to "historical", and the admin list shows the
// wrong bucket. These tests fail loudly when the copies drift.

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

/** Category ids declared in the Flutter `StoryCategory` enum. */
function flutterCategoryIds(): string[] {
  const src = readFileSync(
    path.join(repoRoot, "lib/features/stories/domain/models/story.dart"),
    "utf8",
  );
  // The enum block ends at its constructor; ids after that point belong to
  // unrelated code (e.g. `id: id` in fromFirestore).
  const enumBlock = src.slice(
    src.indexOf("enum StoryCategory {"),
    src.indexOf("const StoryCategory({"),
  );
  return [...enumBlock.matchAll(/id:\s*'([a-z_]+)'/g)].map((m) => m[1]);
}

describe("story category taxonomy", () => {
  test("the site and the Flutter app declare the same category ids", () => {
    const flutter = flutterCategoryIds().sort();
    const web = CATEGORIES.map((c) => c.id).sort();

    expect(flutter.length).toBeGreaterThan(0);
    expect(web).toEqual(flutter);
  });

  test("CATEGORY_BY_ID covers every category exactly once", () => {
    expect(Object.keys(CATEGORY_BY_ID).sort()).toEqual(
      CATEGORIES.map((c) => c.id).sort(),
    );
    for (const c of CATEGORIES) {
      expect(CATEGORY_BY_ID[c.id].id).toBe(c.id);
    }
  });

  test("category ids are unique", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every category carries the metadata the UI renders", () => {
    for (const c of CATEGORIES) {
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.tagline.length).toBeGreaterThan(0);
      expect(c.iconKey.length).toBeGreaterThan(0);
      expect(c.textTone.length).toBeGreaterThan(0);
    }
  });

  test("category brand colours match the Flutter enum", () => {
    // Both surfaces render the same story card; a colour that drifted would
    // make the app and the site disagree about a category's identity.
    const src = readFileSync(
      path.join(repoRoot, "lib/features/stories/domain/models/story.dart"),
      "utf8",
    );
    const enumBlock = src.slice(
      src.indexOf("enum StoryCategory {"),
      src.indexOf("const StoryCategory({"),
    );
    const pairs = [
      ...enumBlock.matchAll(/id:\s*'([a-z_]+)'[\s\S]*?colorValue:\s*0xFF([0-9A-Fa-f]{6})/g),
    ];

    expect(pairs.length).toBe(CATEGORIES.length);
    for (const [, id, hex] of pairs) {
      const web = CATEGORIES.find((c) => c.id === id);
      expect(web, `no web category for '${id}'`).toBeDefined();
      expect(web!.color.toUpperCase()).toBe(`#${hex.toUpperCase()}`);
    }
  });
});

describe("moderation reasons", () => {
  test("the Flutter report sheet and the Firestore rules agree", () => {
    // A reason the rules don't list is rejected at write time, so the user
    // taps Submit and the report vanishes with a permission error.
    const sheet = readFileSync(
      path.join(
        repoRoot,
        "lib/features/stories/presentation/widgets/report_story_sheet.dart",
      ),
      "utf8",
    );
    const reasonBlock = sheet.slice(sheet.indexOf("const Map<String, String> _reasons"));
    const sheetReasons = [...reasonBlock.matchAll(/'([a-z]+)':\s*'/g)]
      .map((m) => m[1])
      .sort();

    const rules = readFileSync(path.join(repoRoot, "firestore.rules"), "utf8");
    const rulesBlock = rules.slice(
      rules.indexOf("match /story_reports/"),
      rules.indexOf("match /attention_tiles/"),
    );
    const listed = rulesBlock.slice(
      rulesBlock.indexOf("data.reason in ["),
      rulesBlock.indexOf("]", rulesBlock.indexOf("data.reason in [")),
    );
    const rulesReasons = [...listed.matchAll(/'([a-z]+)'/g)].map((m) => m[1]).sort();

    expect(sheetReasons.length).toBeGreaterThan(0);
    expect(rulesReasons).toEqual(sheetReasons);
  });
});

describe("cities", () => {
  test("slugs are unique and URL-safe", () => {
    const slugs = CITIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  test("getCityBySlug resolves a known slug and rejects an unknown one", () => {
    const first = CITIES[0];
    expect(getCityBySlug(first.slug)?.slug).toBe(first.slug);
    expect(getCityBySlug("atlantis")).toBeUndefined();
  });

  test("live and upcoming partition the full list", () => {
    expect(liveCities().length + upcomingCities().length).toBe(CITIES.length);
    for (const c of liveCities()) expect(c.status).toBe("live");
    for (const c of upcomingCities()) expect(c.status).toBe("soon");
  });

  test("at least one city is live, so the landing page is never empty", () => {
    expect(liveCities().length).toBeGreaterThan(0);
  });
});
