import "server-only";
import { getAdminBucket, getAdminDb } from "./firebaseAdmin";
import { logAdmin } from "./auditLog";

export type StoryMediaFile = {
  name: string; // basename (e.g. "hero.jpg")
  fullPath: string; // full storage path (e.g. "stories/{id}/hero.jpg")
  size: number; // bytes
  contentType: string;
  updatedAt: string | null; // ISO
  signedReadUrl: string; // 24h signed URL — preview/download in admin UI
  /** True when this filename is in the story's `previewMedia` array. */
  isPreview: boolean;
  /** Permanent public URL (only present when `isPreview` is true). */
  publicUrl: string | null;
};

export type StorySummary = {
  storyId: string;
  fileCount: number;
  totalBytes: number;
  lastUploadedAt: string | null;
};

const READ_URL_TTL_MS = 24 * 60 * 60 * 1000;
const UPLOAD_URL_TTL_MS = 5 * 60 * 1000;

function storyPrefix(storyId: string): string {
  // Same path scheme the existing storage.rules already covers under
  // `match /stories/{path=**}` — admin SDK writes; clients read via auth.
  return `stories/${encodeStoryId(storyId)}/`;
}

function encodeStoryId(storyId: string): string {
  // Story IDs are slug-safe by convention but defensively reject path
  // traversal attempts. Server-side only, but cheap to be paranoid.
  if (storyId.includes("..") || storyId.includes("/")) {
    throw new Error(`Invalid story id: ${storyId}`);
  }
  return storyId;
}

function readMetaTs(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  return null;
}

/**
 * List all files under `stories/{storyId}/`. Each result carries a
 * 24h signed URL so the admin UI can render thumbnails / previews
 * without a second round-trip to Storage. Files that the operator
 * has flagged as preview-public also expose a permanent
 * `publicUrl`.
 */
export async function listStoryMedia(
  storyId: string,
): Promise<StoryMediaFile[]> {
  const bucket = getAdminBucket();
  const [files] = await bucket.getFiles({ prefix: storyPrefix(storyId) });

  const previewSet = await readStoryPreviewSet(storyId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enriched = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    files.map(async (f: any) => {
      const meta = f.metadata ?? {};
      const [signedUrl] = await f.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + READ_URL_TTL_MS,
      });
      const fullPath: string = f.name;
      const basename = fullPath.slice(storyPrefix(storyId).length);
      // Skip the implicit folder marker some clients create.
      if (basename === "") return null;
      const isPreview = previewSet.has(basename);
      return {
        name: basename,
        fullPath,
        size: Number(meta.size ?? 0),
        contentType:
          typeof meta.contentType === "string"
            ? meta.contentType
            : "application/octet-stream",
        updatedAt: readMetaTs(meta.updated),
        signedReadUrl: signedUrl,
        isPreview,
        publicUrl: isPreview ? publicUrlFor(fullPath, bucket.name) : null,
      } as StoryMediaFile;
    }),
  );
  return enriched
    .filter((f): f is StoryMediaFile => f !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function readStoryPreviewSet(storyId: string): Promise<Set<string>> {
  try {
    const snap = await getAdminDb().collection("stories").doc(storyId).get();
    const arr = (snap.data()?.previewMedia ?? []) as unknown[];
    return new Set(
      arr.filter((s): s is string => typeof s === "string" && s.length > 0),
    );
  } catch {
    return new Set();
  }
}

function publicUrlFor(path: string, bucket: string): string {
  // GCS public access pattern. Encode each path segment so spaces/specials
  // don't break the URL.
  const encoded = path
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
  return `https://storage.googleapis.com/${bucket}/${encoded}`;
}

/**
 * Server-side upload from a Web Standards `File` (as you get from a
 * route handler's `formData()`). Returns the new path on success and
 * records a `media.upload` audit entry.
 */
export async function uploadStoryMedia({
  storyId,
  file,
  actorUid,
}: {
  storyId: string;
  file: File;
  actorUid: string;
}): Promise<{ fullPath: string }> {
  const safeName = sanitizeFilename(file.name);
  const fullPath = `${storyPrefix(storyId)}${safeName}`;
  const bucket = getAdminBucket();
  const remote = bucket.file(fullPath);

  const buffer = Buffer.from(await file.arrayBuffer());
  await remote.save(buffer, {
    contentType: file.type || "application/octet-stream",
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=3600",
      metadata: {
        uploadedBy: actorUid,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  await logAdmin({
    actorUid,
    action: "media.upload",
    targetCollection: "storage",
    targetId: fullPath,
    after: { size: file.size, contentType: file.type || null },
  });

  return { fullPath };
}

/**
 * Delete a single file under `stories/{storyId}/`. Records a
 * `media.delete` audit entry with the old size so accidental deletes
 * are recoverable in spirit (we'd at least know what was lost).
 */
export async function deleteStoryMedia({
  storyId,
  filename,
  actorUid,
}: {
  storyId: string;
  filename: string;
  actorUid: string;
}): Promise<void> {
  const safe = sanitizeFilename(filename);
  if (safe !== filename) {
    throw new Error(`Refusing to delete filename with unsafe chars: ${filename}`);
  }
  const fullPath = `${storyPrefix(storyId)}${safe}`;
  const bucket = getAdminBucket();
  const remote = bucket.file(fullPath);

  let beforeSize: number | null = null;
  let beforeContentType: string | null = null;
  try {
    const [meta] = await remote.getMetadata();
    beforeSize = Number(meta.size ?? 0);
    beforeContentType =
      typeof meta.contentType === "string" ? meta.contentType : null;
  } catch {
    // Object may already be gone; delete() will throw a clearer error.
  }

  await remote.delete();

  await logAdmin({
    actorUid,
    action: "media.delete",
    targetCollection: "storage",
    targetId: fullPath,
    before:
      beforeSize !== null
        ? { size: beforeSize, contentType: beforeContentType }
        : undefined,
  });
}

/**
 * Walk every file under `stories/` once and roll up per-story counts
 * for the overview page. Single bucket-list call, no per-story round
 * trips.
 */
export async function listStoryMediaSummaries(): Promise<StorySummary[]> {
  const bucket = getAdminBucket();
  const [files] = await bucket.getFiles({ prefix: "stories/" });

  const byStory = new Map<string, StorySummary>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files.forEach((f: any) => {
    const path: string = f.name;
    // path looks like `stories/<storyId>/<...>`. Skip top-level entries.
    const parts = path.split("/");
    if (parts.length < 3 || parts[0] !== "stories") return;
    const storyId = parts[1];
    if (!storyId) return;
    const meta = f.metadata ?? {};
    const size = Number(meta.size ?? 0);
    const updated = readMetaTs(meta.updated);

    const existing = byStory.get(storyId) ?? {
      storyId,
      fileCount: 0,
      totalBytes: 0,
      lastUploadedAt: null as string | null,
    };
    existing.fileCount += 1;
    existing.totalBytes += size;
    if (
      updated &&
      (existing.lastUploadedAt === null || updated > existing.lastUploadedAt)
    ) {
      existing.lastUploadedAt = updated;
    }
    byStory.set(storyId, existing);
  });

  return Array.from(byStory.values()).sort((a, b) =>
    a.storyId.localeCompare(b.storyId),
  );
}

/**
 * Strip path separators and other unsafe characters from a user-supplied
 * filename. Keeps a recognisable name while ensuring the file lands
 * exactly where we expect.
 */
export function sanitizeFilename(name: string): string {
  // Strip any directory component a browser might preserve.
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "file";
  // Replace anything that isn't a safe filename char.
  const cleaned = base.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned.length > 0 ? cleaned.slice(0, 200) : "file";
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function isImageContentType(ct: string | null | undefined): boolean {
  return typeof ct === "string" && ct.startsWith("image/");
}

/**
 * Flip a single file's preview-public state. Two persistent effects:
 *   1. Storage object ACL: makePublic / makePrivate so the public
 *      story page can render the asset without a signed URL.
 *   2. Story doc: add/remove the filename to the `previewMedia` array.
 *
 * Records `media.upload`-equivalent audit entries so the activity
 * log captures who toggled which asset and when.
 */
export async function setStoryMediaPreview({
  storyId,
  filename,
  isPreview,
  actorUid,
}: {
  storyId: string;
  filename: string;
  isPreview: boolean;
  actorUid: string;
}): Promise<{ publicUrl: string | null }> {
  const safe = sanitizeFilename(filename);
  if (safe !== filename) {
    throw new Error(`Refusing to toggle filename with unsafe chars: ${filename}`);
  }
  const fullPath = `${storyPrefix(storyId)}${safe}`;
  const bucket = getAdminBucket();
  const remote = bucket.file(fullPath);
  const [exists] = await remote.exists();
  if (!exists) {
    throw new Error(`File not found: ${fullPath}`);
  }

  if (isPreview) {
    await remote.makePublic();
  } else {
    // makePrivate strips public ACL only; uploader still owns the object.
    try {
      await remote.makePrivate({ strict: false });
    } catch {
      // Some buckets with uniform IAM (no per-object ACLs) reject this;
      // ignore — the doc-level previewMedia list is the source of truth
      // for what the public site renders.
    }
  }

  const storyRef = getAdminDb().collection("stories").doc(storyId);
  const before = await storyRef.get();
  const prev = (before.data()?.previewMedia ?? []) as unknown[];
  const prevList = prev.filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  );
  const next = isPreview
    ? Array.from(new Set([...prevList, safe]))
    : prevList.filter((s) => s !== safe);
  await storyRef.set(
    { previewMedia: next, updatedAt: new Date().toISOString() },
    { merge: true },
  );

  await logAdmin({
    actorUid,
    action: isPreview ? "media.upload" : "media.delete",
    targetCollection: "storage",
    targetId: fullPath,
    reason: isPreview ? "marked as story preview" : "removed from story preview",
  });

  return { publicUrl: isPreview ? publicUrlFor(fullPath, bucket.name) : null };
}

// Reserved for future signed-direct-upload flow if Hostinger body
// limits become a problem; not used by the current route-handler
// upload path.
export async function signUploadUrl({
  storyId,
  filename,
  contentType,
}: {
  storyId: string;
  filename: string;
  contentType: string;
}): Promise<{ uploadUrl: string; fullPath: string }> {
  const safeName = sanitizeFilename(filename);
  const fullPath = `${storyPrefix(storyId)}${safeName}`;
  const bucket = getAdminBucket();
  const remote = bucket.file(fullPath);
  const [uploadUrl] = await remote.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + UPLOAD_URL_TTL_MS,
    contentType,
  });
  return { uploadUrl, fullPath };
}
