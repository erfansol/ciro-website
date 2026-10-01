import "server-only";
import { createHash } from "node:crypto";
import { getAdminBucket, getAdminDb } from "./firebaseAdmin";
import { logAdmin } from "./auditLog";

/**
 * Unity AssetBundle delivery for Unity-kind stories.
 *
 * Bundles live at `unity_bundles/{storyId}/{platform}/v{N}/story_{id}.bundle`
 * (Storage rules: readable by signed-in users, never client-writable). The
 * app downloads through Firebase Storage with the user's auth, so the URL
 * stored on the story is the `gs://` form — no public ACL needed, unlike
 * preview media. Every upload bumps `bundle.version`, which is what makes
 * installed copies re-download.
 */

export type BundlePlatform = "ios" | "android";

export type BundleUploadResult = {
  platform: BundlePlatform;
  url: string;
  sizeBytes: number;
  sha256: string;
  version: number;
};

export async function uploadStoryBundle(opts: {
  storyId: string;
  platform: BundlePlatform;
  bytes: Buffer;
  actorUid: string;
}): Promise<BundleUploadResult> {
  const { storyId, platform, bytes, actorUid } = opts;
  if (!/^[a-z0-9_-]+$/i.test(storyId)) throw new Error("Unsafe story id.");

  const db = getAdminDb();
  const ref = db.collection("stories").doc(storyId);
  const before = await ref.get();
  if (!before.exists) throw new Error(`Story ${storyId} not found`);
  const existing = ((before.data() as Record<string, unknown>).bundle ?? {}) as Record<string, unknown>;
  const version = (typeof existing.version === "number" ? existing.version : 0) + 1;

  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const bucket = getAdminBucket();
  const dest = `unity_bundles/${storyId}/${platform}/v${version}/story_${storyId}.bundle`;
  await bucket.file(dest).save(bytes, {
    resumable: false,
    metadata: {
      contentType: "application/octet-stream",
      cacheControl: "public, max-age=31536000",
      metadata: { sha256, storyId, platform, version: String(version) },
    },
  });
  const url = `gs://${bucket.name}/${dest}`;

  const bundle: Record<string, unknown> = {
    ...existing,
    [platform === "ios" ? "iosUrl" : "androidUrl"]: url,
    sizeBytes: bytes.length,
    sha256,
    version,
  };
  const updatedAt = new Date().toISOString();
  await ref.update({ bundle, updatedAt });
  await logAdmin({
    actorUid,
    action: "story.update",
    targetCollection: "stories",
    targetId: storyId,
    before: { bundle: existing },
    after: { bundle },
    reason: `bundle upload ${platform} v${version}`,
  });

  return { platform, url, sizeBytes: bytes.length, sha256, version };
}
