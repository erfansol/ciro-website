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

export type StoryPublishStatus = "draft" | "scheduled" | "published";

/** Convenience: derive the lifecycle bucket the admin UI displays. */
export function publishStatus(s: AdminStory): StoryPublishStatus {
  if (s.published) return "published";
  if (s.publishAt && new Date(s.publishAt).getTime() > 0) return "scheduled";
  return "draft";
}

type RawDoc = Record<string, unknown>;

function readNumber(v: unknown): number | undefined {
  return typeof v === "number" ? v : undefined;
}
function readString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function readWaypoints(v: unknown): import("./categories").Waypoint[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: import("./categories").Waypoint[] = [];
  for (const item of v) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    const lat = readNumber(o.lat);
    const lon = readNumber(o.lon);
    if (lat === undefined || lon === undefined) continue;
    const label = readString(o.label);
    out.push(label ? { lat, lon, label } : { lat, lon });
  }
  return out;
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
    publishAt: typeof raw.publishAt === "string" ? raw.publishAt : null,
    priceCents: readNumber(raw.priceCents),
    currency: readString(raw.currency),
    routeCoords: readWaypoints(raw.routeCoords),
    previewMedia: Array.isArray(raw.previewMedia)
      ? raw.previewMedia.filter(
          (m): m is string => typeof m === "string" && m.length > 0,
        )
      : [],
    bannerImage:
      typeof raw.bannerImage === "string" && raw.bannerImage.length > 0
        ? raw.bannerImage
        : null,
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
  // Fold any due-but-not-yet-published scheduled stories first so the
  // list reflects what the public site will actually see this minute.
  await autoPublishDueStories();

  const snap = await getAdminDb().collection("stories").get();
  const docs = snap.docs as Array<{ id: string; data: () => RawDoc }>;
  return docs
    .map((d) => mapAdminDoc(d.id, d.data()))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Lazy cron-replacement: scan for stories whose `publishAt` has passed
 * and flip them to `published: true`, clearing the schedule. Called
 * from the admin stories list and the public listing fetch — runs
 * cheaply (a single query) and writes only when there's something due.
 *
 * For higher-volume deployments, swap this for a Cloud Function on a
 * 1-minute Pub/Sub schedule and remove the call sites.
 */
export async function autoPublishDueStories(): Promise<number> {
  const db = getAdminDb();
  const nowIso = new Date().toISOString();
  const snap = await db
    .collection("stories")
    .where("published", "==", false)
    .where("publishAt", "<=", nowIso)
    .get()
    // Composite index missing on first run — handled gracefully.
    .catch(() => null);
  if (!snap || snap.empty) return 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = snap.docs as Array<any>;
  const batch = db.batch();
  for (const d of docs) {
    batch.update(d.ref, {
      published: true,
      publishAt: null,
      updatedAt: nowIso,
    });
  }
  await batch.commit();

  // Audit each one. Done after the batch so a logging failure doesn't
  // block the publish itself.
  await Promise.all(
    docs.map((d) =>
      logAdmin({
        actorUid: "system:scheduler",
        action: "story.publish",
        targetCollection: "stories",
        targetId: d.id,
        before: d.data(),
        after: { published: true, publishAt: null, updatedAt: nowIso },
        reason: "scheduled publish reached",
      }),
    ),
  );
  return docs.length;
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
  startLabel?: string;
  endLabel?: string;
  lat?: number;
  lon?: number;
  published?: boolean;
  /** ISO timestamp; pass `null` to clear an existing schedule. */
  publishAt?: string | null;
  /** Cents (e.g. 299 = $2.99). 0 = free. */
  priceCents?: number;
  /** ISO 4217. */
  currency?: string;
  /** Replaces the entire route. Pass `[]` to clear. */
  routeCoords?: import("./categories").Waypoint[];
  /** Filename under `stories/{id}/`. `null` clears. */
  bannerImage?: string | null;
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
  if (patch.publishAt !== undefined) update.publishAt = patch.publishAt;
  if (patch.startLabel !== undefined) update.startLabel = patch.startLabel;
  if (patch.endLabel !== undefined) update.endLabel = patch.endLabel;
  if (patch.priceCents !== undefined) update.priceCents = patch.priceCents;
  if (patch.currency !== undefined) update.currency = patch.currency;
  if (patch.routeCoords !== undefined) {
    // Strip undefined/null label keys so Firestore doesn't store empty strings.
    update.routeCoords = patch.routeCoords.map((w) => {
      const out: Record<string, unknown> = { lat: w.lat, lon: w.lon };
      if (w.label && w.label.length > 0) out.label = w.label;
      return out;
    });
  }
  if (patch.bannerImage !== undefined) update.bannerImage = patch.bannerImage;

  await ref.update(update);

  const after = await ref.get();
  // Choose the most-specific audit action so the activity timeline
  // reads naturally. Schedule wins over publish when both move.
  const action: "story.publish" | "story.unpublish" | "story.schedule" | "story.move" | "story.update" =
    patch.publishAt && patch.published === false
      ? "story.schedule"
      : patch.published === true
        ? "story.publish"
        : patch.published === false
          ? "story.unpublish"
          : patch.lat !== undefined
            ? "story.move"
            : "story.update";
  await logAdmin({
    actorUid,
    action,
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

// ── Bulk export / import ──────────────────────────────────────────────

export type ExportedStory = { id: string } & Record<string, unknown>;

/**
 * Dump every story doc as a JSON-serialisable object. Round-trippable
 * via `importStories`. Field order isn't guaranteed.
 */
export async function exportAllStories(): Promise<ExportedStory[]> {
  const snap = await getAdminDb().collection("stories").get();
  const docs = snap.docs as Array<{ id: string; data: () => RawDoc }>;
  return docs
    .map((d) => ({ id: d.id, ...d.data() } as ExportedStory))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export type ImportPlan = {
  toCreate: Array<{ id: string; title: string }>;
  toUpdate: Array<{ id: string; title: string }>;
  invalid: Array<{ index: number; reason: string }>;
};

export type ImportResult = ImportPlan & {
  createdIds: string[];
  updatedIds: string[];
};

const MIN_REQUIRED_FIELDS = ["id", "title", "city", "category"] as const;

function validateImportEntry(
  raw: unknown,
  index: number,
): { ok: true; value: ExportedStory } | { ok: false; reason: string } {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, reason: `entry ${index} is not an object` };
  }
  const obj = raw as Record<string, unknown>;
  for (const k of MIN_REQUIRED_FIELDS) {
    if (typeof obj[k] !== "string" || (obj[k] as string).length === 0) {
      return { ok: false, reason: `entry ${index} missing required string ${k}` };
    }
  }
  const id = obj.id as string;
  if (id.includes("/") || id.includes("..")) {
    return { ok: false, reason: `entry ${index} has unsafe id ${id}` };
  }
  return { ok: true, value: obj as ExportedStory };
}

/**
 * Plan an import without writing — used for the dry-run preview the
 * UI shows before the operator confirms.
 */
export async function planStoryImport(
  payload: unknown,
): Promise<ImportPlan> {
  if (!Array.isArray(payload)) {
    throw new Error("Import payload must be a JSON array of story objects.");
  }
  const db = getAdminDb();
  const validated: ExportedStory[] = [];
  const invalid: ImportPlan["invalid"] = [];
  payload.forEach((raw, i) => {
    const v = validateImportEntry(raw, i);
    if (v.ok) validated.push(v.value);
    else invalid.push({ index: i, reason: v.reason });
  });

  if (validated.length === 0) {
    return { toCreate: [], toUpdate: [], invalid };
  }

  // Single multi-doc fetch instead of N gets.
  const refs = validated.map((s) => db.collection("stories").doc(s.id));
  const snaps = await db.getAll(...refs);
  const toCreate: ImportPlan["toCreate"] = [];
  const toUpdate: ImportPlan["toUpdate"] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (snaps as any[]).forEach((snap: { exists: boolean }, i: number) => {
    const s = validated[i];
    const summary = { id: s.id, title: String(s.title) };
    if (snap.exists) toUpdate.push(summary);
    else toCreate.push(summary);
  });
  return { toCreate, toUpdate, invalid };
}

/**
 * Apply an import plan after the operator confirms. Each create /
 * update writes a single doc and a single audit entry; one summary
 * `story.import` row records who triggered the bulk action.
 */
export async function importStories(
  payload: unknown,
  actorUid: string,
): Promise<ImportResult> {
  const plan = await planStoryImport(payload);
  if (plan.invalid.length > 0 && plan.toCreate.length === 0 && plan.toUpdate.length === 0) {
    throw new Error(
      `Import payload had no valid entries (${plan.invalid.length} invalid).`,
    );
  }
  const db = getAdminDb();
  const now = new Date().toISOString();

  // We already validated; resolve back to the validated objects.
  if (!Array.isArray(payload)) {
    throw new Error("Import payload must be an array.");
  }
  const validated: ExportedStory[] = [];
  payload.forEach((raw, i) => {
    const v = validateImportEntry(raw, i);
    if (v.ok) validated.push(v.value);
  });

  const createdIds: string[] = [];
  const updatedIds: string[] = [];

  // Write one doc at a time so partial failures can be diagnosed
  // (a 500-story batch error would otherwise be opaque).
  for (const s of validated) {
    const ref = db.collection("stories").doc(s.id);
    const before = await ref.get();
    const exists = before.exists;
    const next: Record<string, unknown> = { ...s, updatedAt: now };
    delete (next as { id?: string }).id; // id lives in the doc path, not the body.
    await ref.set(next, { merge: true });
    if (exists) {
      updatedIds.push(s.id);
      await logAdmin({
        actorUid,
        action: "story.update",
        targetCollection: "stories",
        targetId: s.id,
        before: before.data() as Record<string, unknown>,
        after: next,
        reason: "bulk import",
      });
    } else {
      createdIds.push(s.id);
      await logAdmin({
        actorUid,
        action: "story.create",
        targetCollection: "stories",
        targetId: s.id,
        after: next,
        reason: "bulk import",
      });
    }
  }

  await logAdmin({
    actorUid,
    action: "story.import",
    targetCollection: "stories",
    targetId: "_summary",
    after: {
      created: createdIds.length,
      updated: updatedIds.length,
      invalid: plan.invalid.length,
    },
  });

  return { ...plan, createdIds, updatedIds };
}
