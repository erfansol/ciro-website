"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  deleteStory,
  updateStory,
  type StoryPatch,
} from "@/lib/storyAdmin";
import { CATEGORY_BY_ID, type StoryCategoryId } from "@/lib/categories";

const VALID_CATEGORIES = new Set<StoryCategoryId>(
  Object.keys(CATEGORY_BY_ID) as StoryCategoryId[],
);

function readStr(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : undefined;
}

function readNum(fd: FormData, key: string): number | undefined {
  const v = fd.get(key);
  if (typeof v !== "string" || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function readBool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}

export async function saveStoryAction(id: string, fd: FormData) {
  const session = await requireRole(["admin", "editor"]);

  const patch: StoryPatch = {};

  const title = readStr(fd, "title");
  if (title !== undefined && title.length > 0) patch.title = title;

  const description = readStr(fd, "description");
  if (description !== undefined) patch.description = description;

  const city = readStr(fd, "city");
  if (city !== undefined && city.length > 0) patch.city = city;

  const category = readStr(fd, "category");
  if (
    category !== undefined &&
    VALID_CATEGORIES.has(category as StoryCategoryId)
  ) {
    patch.category = category as StoryCategoryId;
  }

  const durationLabel = readStr(fd, "durationLabel");
  if (durationLabel !== undefined) patch.durationLabel = durationLabel;

  const lat = readNum(fd, "lat");
  const lon = readNum(fd, "lon");
  if (lat !== undefined && lon !== undefined) {
    patch.lat = lat;
    patch.lon = lon;
  }

  patch.published = readBool(fd, "published");

  await updateStory(id, patch, session.uid);

  // Refresh listings so the stories list, sitemap, and the public site
  // pick up the change immediately.
  revalidatePath("/admin/stories");
  revalidatePath("/admin/world");
  revalidatePath("/");
  revalidatePath("/stories");
  revalidatePath(`/stories/${id}`);
}

export async function deleteStoryAction(id: string) {
  const session = await requireRole(["admin"]);
  await deleteStory(id, session.uid);
  revalidatePath("/admin/stories");
  revalidatePath("/admin/world");
  revalidatePath("/stories");
  redirect("/admin/stories");
}

/**
 * Used by the world map drag-to-move-pin UI. Smaller payload than the
 * full editor save and writes a `story.move` audit row.
 */
export async function moveStoryPinAction(
  id: string,
  lat: number,
  lon: number,
) {
  const session = await requireRole(["admin", "editor"]);
  await updateStory(id, { lat, lon }, session.uid);
  revalidatePath("/admin/world");
  revalidatePath("/admin/stories");
  revalidatePath(`/stories/${id}`);
}
