import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Submission } from "./storage";
import type { FirestoreStory, StoryCategoryId } from "./categories";

// firebase-admin's modular .d.ts re-exports types from a namespaced
// @google-cloud/firestore declaration (`FirebaseFirestore.*`), so the
// modular names (`App`, `Firestore`, `Timestamp`) don't resolve under
// `moduleResolution: "bundler"`. This file is the only place that
// touches those values, so we keep the cached client as `any` and rely
// on the strongly-typed `FirestoreStory` boundary at the exports.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: any = null;

function readEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function isFirebaseConfigured(): boolean {
  return readEnv() !== null;
}

function db() {
  if (cached) return cached;
  const env = readEnv();
  if (!env) {
    throw new Error(
      "Firebase backend selected but FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are missing.",
    );
  }
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: env.projectId,
        clientEmail: env.clientEmail,
        privateKey: env.privateKey,
      }),
    });
  cached = getFirestore(app);
  return cached;
}

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
