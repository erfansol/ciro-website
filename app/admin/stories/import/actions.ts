"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  importStories,
  planStoryImport,
  type ImportPlan,
  type ImportResult,
} from "@/lib/storyAdmin";

export type ImportPreviewResult =
  | { ok: true; plan: ImportPlan }
  | { ok: false; error: string };

export type ImportApplyResult =
  | { ok: true; result: ImportResult }
  | { ok: false; error: string };

function parsePayload(raw: unknown): unknown {
  if (typeof raw !== "string") {
    throw new Error("Paste / upload contained no text.");
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid JSON.";
    throw new Error(`JSON parse failed: ${msg}`);
  }
}

export async function previewImportAction(
  formData: FormData,
): Promise<ImportPreviewResult> {
  try {
    await requireAdmin();
    const json = parsePayload(formData.get("payload"));
    const plan = await planStoryImport(json);
    return { ok: true, plan };
  } catch (err) {
    console.error("[stories/import] preview failed:", err);
    const msg = err instanceof Error ? err.message : "Preview failed.";
    return { ok: false, error: msg };
  }
}

export async function applyImportAction(
  formData: FormData,
): Promise<ImportApplyResult> {
  try {
    const session = await requireAdmin();
    const json = parsePayload(formData.get("payload"));
    const result = await importStories(json, session.uid);
    revalidatePath("/admin/stories");
    revalidatePath("/admin/world");
    revalidatePath("/stories");
    return { ok: true, result };
  } catch (err) {
    console.error("[stories/import] apply failed:", err);
    const msg = err instanceof Error ? err.message : "Import failed.";
    return { ok: false, error: msg };
  }
}
