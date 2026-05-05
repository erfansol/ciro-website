/**
 * Pure types + brand constants for the 5 Ciro story categories. This
 * file is intentionally free of any Node-only imports (no firebase-admin,
 * no fs) so client components like the hero / acts spine can import
 * `CATEGORIES` and the colour palette without dragging server code into
 * the browser bundle.
 *
 * Server-only loaders live in `lib/stories.ts`.
 */

export type StoryCategoryId =
  | "historical"
  | "hidden_layers"
  | "interactive"
  | "cinematic"
  | "personal_reflection";

export type CategoryIconKey =
  | "temple"
  | "eye"
  | "controller"
  | "clapper"
  | "heart";

export type StoryCategoryMeta = {
  id: StoryCategoryId;
  label: string;
  /** One-line tease shown on the act for this category. No em-dashes. */
  tagline: string;
  /** Brand hex straight from the Story Cards reference design. */
  color: string;
  iconKey: CategoryIconKey;
  /** Tailwind text class for use against dark backgrounds. */
  textTone: string;
};

export const CATEGORIES: ReadonlyArray<StoryCategoryMeta> = [
  {
    id: "historical",
    label: "Historical",
    tagline: "Some places remember.",
    color: "#D4A017",
    iconKey: "temple",
    textTone: "text-[#F5C84A]",
  },
  {
    id: "hidden_layers",
    label: "Hidden Layers",
    tagline: "Beneath the surface, another city.",
    color: "#6E4CA3",
    iconKey: "eye",
    textTone: "text-[#B392E0]",
  },
  {
    id: "interactive",
    label: "Interactive",
    tagline: "Step in. Solve. Belong.",
    color: "#2CA6A4",
    iconKey: "controller",
    textTone: "text-[#7BD8D6]",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    tagline: "The frame is still warm.",
    color: "#FF7A45",
    iconKey: "clapper",
    textTone: "text-[#FFB089]",
  },
  {
    id: "personal_reflection",
    label: "Personal Reflection",
    tagline: "Pause. Listen to yourself.",
    color: "#4A90E2",
    iconKey: "heart",
    textTone: "text-[#8FBCEF]",
  },
];

export const CATEGORY_BY_ID: Record<StoryCategoryId, StoryCategoryMeta> =
  Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
    StoryCategoryId,
    StoryCategoryMeta
  >;

/**
 * Plain-data shape of a story document (Firestore or local fallback).
 * Defined here so client components can type props without pulling the
 * firebase-admin module graph.
 */
export type FirestoreStory = {
  id: string;
  title: string;
  description: string;
  city: string;
  category: StoryCategoryId;
  durationLabel?: string;
  startLabel?: string;
  endLabel?: string;
  lat?: number;
  lon?: number;
  moods: string[];
  hasAr: boolean;
  updatedAt?: string;
};

/** Story plus its resolved category meta. JSON-serialisable. */
export type Story = FirestoreStory & {
  meta: StoryCategoryMeta;
};
