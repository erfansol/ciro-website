import "server-only";
import { getAdminDb } from "./firebaseAdmin";
import { CATEGORY_BY_ID, type FirestoreStory } from "./categories";
import { logAdmin } from "./auditLog";

export type AdminStory = FirestoreStory & {
  published: boolean;
  authorUid?: string;
  source?: "human" | "ai-assisted" | "ai-generated";
  moderationStatus?: "draft" | "pending" | "approved" | "rejected";
  views?: number;
  completions?: number;
};

type RawDoc = Record<string, unknown>;

function readNumber(v: unknown): number | undefined {
  return typeof v === "number" ? v : undefined;
}
function readString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function mapAdminDoc(id: string, raw: RawDoc): AdminStory {
  const cat = readString(raw.category) ?? "historical";
  const category = (CATEGORY_BY_ID[cat as keyof typeof CATEGORY_BY_ID]
    ? cat
    : "historical") as AdminStory["category"];

  const center = raw.mapCenter as { lat?: number; lon?: number } | undefined;
  const bundle = raw.bundle as { iosUrl?: string; androidUrl?: string } | undefined;
  const moderation = raw.moderation as { status?: string } | undefined;
  const stats = raw.stats as { views?: number; completions?: number } | undefined;

  return {
    id,
    title: readString(raw.title) ?? "Untitled story",
    description: readString(raw.description) ?? "",
    city: readString(raw.city) ?? "Rome",
    category,
    durationLabel: readString(raw.durationLabel),
    startLabel: readString(raw.startLabel),
    endLabel: readString(raw.endLabel),
    lat: readNumber(center?.lat),
    lon: readNumber(center?.lon),
    moods: Array.isArray(raw.moods)
      ? raw.moods.filter((m): m is string => typeof m === "string")
      : [],
    hasAr: Boolean(bundle?.iosUrl || bundle?.androidUrl),
    published: raw.published === true,
    authorUid: readString(raw.authorUid),
    source: (readString(raw.source) as AdminStory["source"]) ?? undefined,
    moderationStatus:
      (readString(moderation?.status) as AdminStory["moderationStatus"]) ??
      undefined,
    views: readNumber(stats?.views),
    completions: readNumber(stats?.completions),
  };
}

export async function listAdminStories(): Promise<AdminStory[]> {
  const snap = await getAdminDb().collection("stories").get();
  const docs = snap.docs as Array<{ id: string; data: () => RawDoc }>;
  return docs
    .map((d) => mapAdminDoc(d.id, d.data()))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getAdminStory(id: string): Promise<AdminStory | null> {
  const doc = await getAdminDb().collection("stories").doc(id).get();
  if (!doc.exists) return null;
  return mapAdminDoc(doc.id, doc.data() as RawDoc);
}

export type StoryPatch = {
  title?: string;
  description?: string;
  city?: string;
  category?: AdminStory["category"];
  durationLabel?: string;
  lat?: number;
  lon?: number;
  published?: boolean;
};

/**
 * Apply a partial update to a story doc. Only known fields are written
 * (no client-controlled key names) and an audit entry is recorded with
 * the before/after snapshots.
 */
export async function updateStory(
  id: string,
  patch: StoryPatch,
  actorUid: string,
): Promise<AdminStory> {
  const ref = getAdminDb().collection("stories").doc(id);
  const before = await ref.get();
  if (!before.exists) {
    throw new Error(`Story ${id} not found`);
  }

  const update: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (patch.title !== undefined) update.title = patch.title;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.city !== undefined) update.city = patch.city;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.durationLabel !== undefined)
    update.durationLabel = patch.durationLabel;
  if (patch.lat !== undefined && patch.lon !== undefined) {
    update.mapCenter = { lat: patch.lat, lon: patch.lon };
  }
  if (patch.published !== undefined) update.published = patch.published;

  await ref.update(update);

  const after = await ref.get();
  await logAdmin({
    actorUid,
    action:
      patch.published === true
        ? "story.publish"
        : patch.published === false
          ? "story.unpublish"
          : patch.lat !== undefined
            ? "story.move"
            : "story.update",
    targetCollection: "stories",
    targetId: id,
    before: before.data() as Record<string, unknown>,
    after: after.data() as Record<string, unknown>,
  });

  return mapAdminDoc(after.id, after.data() as RawDoc);
}

export async function deleteStory(id: string, actorUid: string): Promise<void> {
  const ref = getAdminDb().collection("stories").doc(id);
  const before = await ref.get();
  if (!before.exists) return;
  await ref.delete();
  await logAdmin({
    actorUid,
    action: "story.delete",
    targetCollection: "stories",
    targetId: id,
    before: before.data() as Record<string, unknown>,
  });
}
