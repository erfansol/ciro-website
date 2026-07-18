"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { logAdmin } from "@/lib/auditLog";
import { CATEGORY_BY_ID, type StoryCategoryId } from "@/lib/categories";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function createStoryAction(fd: FormData) {
  const session = await requireRole(["admin", "editor"]);

  const rawId = (fd.get("id") as string | null)?.trim() ?? "";
  const title = (fd.get("title") as string | null)?.trim() ?? "";
  const city = (fd.get("city") as string | null)?.trim() ?? "";
  const category = (fd.get("category") as string | null)?.trim() ?? "historical";

  if (!rawId || !SLUG_RE.test(rawId)) {
    throw new Error(
      'Story ID must be lowercase letters, numbers, and hyphens only (e.g. "rome-colosseum").',
    );
  }
  if (rawId.length > 80) {
    throw new Error("Story ID must be 80 characters or fewer.");
  }
  if (!title) throw new Error("Title is required.");
  if (!city) throw new Error("City is required.");
  if (!CATEGORY_BY_ID[category as StoryCategoryId]) {
    throw new Error(`Unknown category: ${category}`);
  }

  const db = getAdminDb();
  const ref = db.collection("stories").doc(rawId);
  const existing = await ref.get();
  if (existing.exists) {
    throw new Error(
      `A story with id "${rawId}" already exists. Choose a different ID.`,
    );
  }

  const now = new Date().toISOString();
  const doc = {
    title,
    city,
    category,
    description: "",
    moods: [],
    published: false,
    publishAt: null,
    priceCents: 0,
    currency: "USD",
    routeCoords: [],
    previewMedia: [],
    hasAr: false,
    createdAt: now,
    updatedAt: now,
    authorUid: session.uid,
  };

  await ref.set(doc);
  await logAdmin({
    actorUid: session.uid,
    action: "story.create",
    targetCollection: "stories",
    targetId: rawId,
    after: doc,
  });

  revalidatePath("/admin/stories");
  revalidatePath("/admin/world");
  redirect(`/admin/stories/${rawId}`);
}
