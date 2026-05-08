"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  deleteStoryMedia,
  setStoryBanner,
  setStoryMediaPreview,
} from "@/lib/mediaAdmin";

export type MediaActionResult = { ok: true } | { ok: false; error: string };

export async function togglePreviewAction(
  formData: FormData,
): Promise<MediaActionResult> {
  try {
    const session = await requireAdmin();
    const storyId = formData.get("storyId");
    const filename = formData.get("filename");
    const next = formData.get("next");
    if (typeof storyId !== "string" || storyId.length === 0)
      return { ok: false, error: "Missing storyId" };
    if (typeof filename !== "string" || filename.length === 0)
      return { ok: false, error: "Missing filename" };
    const isPreview = next === "true";
    await setStoryMediaPreview({
      storyId,
      filename,
      isPreview,
      actorUid: session.uid,
    });
    revalidatePath(`/admin/stories/${storyId}/media`);
    revalidatePath(`/admin/stories/${storyId}`);
    revalidatePath(`/stories/${storyId}`);
    return { ok: true };
  } catch (err) {
    console.error("[media/actions] togglePreview failed:", err);
    const msg = err instanceof Error ? err.message : "Toggle failed";
    return { ok: false, error: msg };
  }
}

export async function setBannerAction(
  formData: FormData,
): Promise<MediaActionResult> {
  try {
    const session = await requireAdmin();
    const storyId = formData.get("storyId");
    const filename = formData.get("filename");
    if (typeof storyId !== "string" || storyId.length === 0)
      return { ok: false, error: "Missing storyId" };
    const fname =
      typeof filename === "string" && filename.length > 0 ? filename : null;
    await setStoryBanner({
      storyId,
      filename: fname,
      actorUid: session.uid,
    });
    revalidatePath(`/admin/stories/${storyId}/media`);
    revalidatePath(`/admin/stories/${storyId}`);
    revalidatePath(`/stories/${storyId}`);
    return { ok: true };
  } catch (err) {
    console.error("[media/actions] setBanner failed:", err);
    const msg = err instanceof Error ? err.message : "Set banner failed";
    return { ok: false, error: msg };
  }
}

export async function deleteMediaAction(
  formData: FormData,
): Promise<MediaActionResult> {
  try {
    const session = await requireAdmin();
    const storyId = formData.get("storyId");
    const filename = formData.get("filename");
    if (typeof storyId !== "string" || storyId.length === 0) {
      return { ok: false, error: "Missing storyId" };
    }
    if (typeof filename !== "string" || filename.length === 0) {
      return { ok: false, error: "Missing filename" };
    }
    await deleteStoryMedia({ storyId, filename, actorUid: session.uid });
    revalidatePath(`/admin/stories/${storyId}/media`);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (err) {
    console.error("[media/actions] delete failed:", err);
    const msg = err instanceof Error ? err.message : "Delete failed";
    return { ok: false, error: msg };
  }
}
