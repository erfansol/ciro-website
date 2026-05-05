import "server-only";
import { fetchPublishedStories, fetchStoryById } from "./firebase";
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  type FirestoreStory,
  type Story,
  type StoryCategoryId,
  type StoryCategoryMeta,
} from "./categories";

// Re-export client-safe types/constants so server consumers can keep
// importing from a single module (`@/lib/stories`).
export {
  CATEGORIES,
  CATEGORY_BY_ID,
  type CategoryIconKey,
  type FirestoreStory,
  type Story,
  type StoryCategoryId,
  type StoryCategoryMeta,
} from "./categories";

/**
 * Local fallback for local dev / preview builds where Firebase env vars
 * are unset. Mirrors the shape of real Firestore docs so the rest of
 * the site renders identically regardless of source.
 */
const LOCAL_FALLBACK: FirestoreStory[] = [
  {
    id: "rome-colosseum-night",
    title: "The Night the Colosseum Sang",
    description:
      "Once, fifty thousand voices made the river tremble. Stand on the arena floor and hear what the stones still hold.",
    city: "Rome",
    category: "historical",
    durationLabel: "8 min",
    lat: 41.8902,
    lon: 12.4922,
    moods: ["history", "ancient Rome"],
    hasAr: true,
  },
  {
    id: "rome-bernini-secret",
    title: "Bernini's Hidden Signature",
    description:
      "An insult carved in marble, only visible from one angle on Piazza Navona. Locals know exactly where to stand.",
    city: "Rome",
    category: "hidden_layers",
    durationLabel: "5 min",
    lat: 41.8992,
    lon: 12.4731,
    moods: ["art", "Baroque"],
    hasAr: true,
  },
  {
    id: "rome-trastevere-secrets",
    title: "Trastevere After Midnight",
    description:
      "A neighborhood that refuses to be a museum. Walk where Roman and Jewish histories braid in the dark.",
    city: "Rome",
    category: "interactive",
    durationLabel: "12 min",
    lat: 41.8895,
    lon: 12.4685,
    moods: ["nightlife"],
    hasAr: false,
  },
  {
    id: "rome-roman-holiday",
    title: "Where Audrey Stood",
    description:
      "The Spanish Steps still keep the angle of the camera. Re-enter the frame, sixty-three years later.",
    city: "Rome",
    category: "cinematic",
    durationLabel: "6 min",
    lat: 41.9059,
    lon: 12.4823,
    moods: ["film", "1953"],
    hasAr: true,
  },
  {
    id: "rome-aventine-keyhole",
    title: "The Keyhole on the Aventine",
    description:
      "Three countries through a small brass hole. Pause. Decide what you came here looking for.",
    city: "Rome",
    category: "personal_reflection",
    durationLabel: "4 min",
    lat: 41.8841,
    lon: 12.4781,
    moods: ["quiet"],
    hasAr: false,
  },
];

function decorate(s: FirestoreStory): Story {
  return { ...s, meta: CATEGORY_BY_ID[s.category] };
}

export async function loadStories(): Promise<Story[]> {
  try {
    const live = await fetchPublishedStories();
    if (live && live.length > 0) return live.map(decorate);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[stories] Firestore read failed, using local fallback:", err);
    }
  }
  return LOCAL_FALLBACK.map(decorate);
}

export async function loadStoryById(id: string): Promise<Story | null> {
  try {
    const live = await fetchStoryById(id);
    if (live) return decorate(live);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[stories] Firestore read failed for ${id}:`, err);
    }
  }
  const local = LOCAL_FALLBACK.find((s) => s.id === id);
  return local ? decorate(local) : null;
}

export async function loadStoriesByCity(citySlug: string): Promise<Story[]> {
  const all = await loadStories();
  const target = citySlug.toLowerCase();
  return all.filter((s) => s.city.toLowerCase() === target);
}

/**
 * Returns the first story per category, in the canonical CATEGORIES
 * order. Used by the homepage 5-act spine so each balloon shows a real,
 * live teaser when one exists, and stays empty otherwise.
 */
export function pickFeaturedPerCategory(
  stories: Story[],
): Array<{ category: StoryCategoryMeta; story: Story | null }> {
  const seen = new Map<StoryCategoryId, Story>();
  for (const s of stories) {
    if (!seen.has(s.category)) seen.set(s.category, s);
  }
  return CATEGORIES.map((category) => ({
    category,
    story: seen.get(category.id) ?? null,
  }));
}
