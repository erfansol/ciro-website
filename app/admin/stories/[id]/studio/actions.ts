"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { updateStory } from "@/lib/storyAdmin";
import {
  draftWalk,
  renderWalkAudio,
  saveProduction,
  saveWalk,
  type DraftBrief,
  type DraftResult,
  type RenderResult,
} from "@/lib/studioAdmin";
import type { ProductionData, WalkDoc } from "@/lib/walkSchema";

export type ActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function fail(err: unknown, fallback: string): { ok: false; error: string } {
  console.error("[studio]", err);
  return { ok: false, error: err instanceof Error ? err.message : fallback };
}

function revalidateStory(id: string) {
  revalidatePath("/admin/stories");
  revalidatePath(`/admin/stories/${id}`);
  revalidatePath(`/admin/stories/${id}/studio`);
  revalidatePath("/admin/world");
  revalidatePath("/stories");
  revalidatePath(`/stories/${id}`);
}

export async function saveWalkAction(
  id: string,
  walk: unknown,
): Promise<ActionResult<WalkDoc>> {
  try {
    const session = await requireRole(["admin", "editor"]);
    const saved = await saveWalk(id, walk, session.uid);
    revalidateStory(id);
    return { ok: true, value: saved };
  } catch (err) {
    return fail(err, "Could not save the walk.");
  }
}

export async function saveProductionAction(
  id: string,
  production: unknown,
): Promise<ActionResult<ProductionData>> {
  try {
    const session = await requireRole(["admin", "editor"]);
    const saved = await saveProduction(id, production, session.uid);
    revalidateStory(id);
    return { ok: true, value: saved };
  } catch (err) {
    return fail(err, "Could not save production status.");
  }
}

/** Drafts a walk with the configured model. Nothing is written. */
export async function draftWalkAction(
  brief: DraftBrief,
): Promise<ActionResult<DraftResult>> {
  try {
    await requireRole(["admin", "editor"]);
    if (!brief.title.trim() || !brief.concept.trim()) {
      return { ok: false, error: "Give the draft a title and a concept." };
    }
    const stops = Math.min(8, Math.max(3, Math.round(brief.stops || 5)));
    const result = await draftWalk({ ...brief, stops });
    return { ok: true, value: result };
  } catch (err) {
    return fail(err, "Drafting failed.");
  }
}

/**
 * Writes an accepted AI draft: the walk, the card copy it proposed, and a
 * production record naming the model, so "where did this script come
 * from" is always answerable.
 */
export async function applyDraftAction(
  id: string,
  draft: DraftResult,
): Promise<ActionResult<WalkDoc>> {
  try {
    const session = await requireRole(["admin", "editor"]);
    const saved = await saveWalk(id, draft.walk, session.uid);
    await updateStory(
      id,
      {
        title: draft.card.title,
        description: draft.card.description,
        moods: draft.card.moods,
        durationLabel: draft.card.durationLabel,
      },
      session.uid,
    );
    await saveProduction(
      id,
      { stage: "draft", source: "ai-generated", draftModel: draft.model, checklist: {}, notes: "" },
      session.uid,
    );
    revalidateStory(id);
    return { ok: true, value: saved };
  } catch (err) {
    return fail(err, "Could not apply the draft.");
  }
}

export async function renderAudioAction(
  id: string,
  force: boolean,
): Promise<ActionResult<RenderResult>> {
  try {
    const session = await requireRole(["admin", "editor"]);
    const result = await renderWalkAudio(id, session.uid, { force });
    revalidateStory(id);
    return { ok: true, value: result };
  } catch (err) {
    return fail(err, "Rendering failed.");
  }
}
