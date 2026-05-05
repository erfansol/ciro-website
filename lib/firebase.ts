import "server-only";
import { getAdminDb, isFirebaseConfigured } from "./firebaseAdmin";
import type { Submission } from "./storage";
import type { FirestoreStory, StoryCategoryId } from "./categories";

export { isFirebaseConfigured } from "./firebaseAdmin";

const db = getAdminDb;

export async function saveSubmission(entry: Submission) {
  await db()
    .collection(`ciro_${entry.kind}`)
    .add({
      ...entry.payload,
      receivedAt: entry.receivedAt,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
    });
}

const KNOWN_CATEGORIES: ReadonlySet<StoryCategoryId> = new Set([
  "historical",
  "hidden_layers",
  "interactive",
  "cinematic",
  "personal_reflection",
]);

function toIso(value: unknown): string | undefined {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

function mapDoc(id: string, raw: Record<string, unknown>): FirestoreStory {
  const cat = typeof raw.category === "string" ? raw.category : "historical";
  const category = (KNOWN_CATEGORIES.has(cat as StoryCategoryId)
    ? cat
    : "historical") as StoryCategoryId;

  const center = raw.mapCenter as { lat?: number; lon?: number } | undefined;
  const bundle = raw.bundle as { iosUrl?: string; androidUrl?: string } | undefined;
  const hasAr = Boolean(bundle?.iosUrl || bundle?.androidUrl);

  const moods = Array.isArray(raw.moods)
    ? raw.moods.filter((m): m is string => typeof m === "string")
    : [];

  return {
    id,
    title: typeof raw.title === "string" && raw.title ? raw.title : "Untitled story",
    description: typeof raw.description === "string" ? raw.description : "",
    city: typeof raw.city === "string" && raw.city ? raw.city : "Rome",
    category,
    durationLabel: typeof raw.durationLabel === "string" ? raw.durationLabel : undefined,
    startLabel: typeof raw.startLabel === "string" ? raw.startLabel : undefined,
    endLabel: typeof raw.endLabel === "string" ? raw.endLabel : undefined,
    lat: typeof center?.lat === "number" ? center.lat : undefined,
    lon: typeof center?.lon === "number" ? center.lon : undefined,
    moods,
    hasAr,
    updatedAt: toIso(raw.updatedAt),
  };
}

/**
 * Read all stories where `published == true`. Returns null if Firebase
 * env vars are missing, so callers can fall back to the local catalog
 * during local dev / preview builds.
 */
type SnapshotDoc = { id: string; data: () => Record<string, unknown> };
type Snapshot = { docs: SnapshotDoc[] };
type DocSnapshot = {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
};

export async function fetchPublishedStories(): Promise<FirestoreStory[] | null> {
  if (!isFirebaseConfigured()) return null;
  const snap: Snapshot = await db()
    .collection("stories")
    .where("published", "==", true)
    .get();
  return snap.docs.map((d: SnapshotDoc) => mapDoc(d.id, d.data()));
}

export async function fetchStoryById(id: string): Promise<FirestoreStory | null> {
  if (!isFirebaseConfigured()) return null;
  const ref = db().collection("stories").doc(id);
  const doc: DocSnapshot = await ref.get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data || data.published !== true) return null;
  return mapDoc(doc.id, data);
}
