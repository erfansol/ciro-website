"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setReportStatus } from "@/lib/reportsAdmin";

export type ReportActionResult = { ok: true } | { ok: false; error: string };

export async function resolveReportAction(
  formData: FormData,
): Promise<ReportActionResult> {
  return run(formData, "resolved");
}

export async function dismissReportAction(
  formData: FormData,
): Promise<ReportActionResult> {
  return run(formData, "dismissed");
}

async function run(
  formData: FormData,
  status: "resolved" | "dismissed",
): Promise<ReportActionResult> {
  try {
    const session = await requireAdmin();
    const id = formData.get("id");
    if (typeof id !== "string" || id.length === 0) {
      return { ok: false, error: "Missing report id" };
    }
    const notes = (formData.get("notes") as string | null)?.trim() || undefined;
    await setReportStatus(id, status, session.uid, notes);
    revalidatePath("/admin/moderation");
    revalidatePath(`/admin/users/${session.uid}`);
    return { ok: true };
  } catch (err) {
    console.error(`[moderation/actions] ${status} failed:`, err);
    const msg = err instanceof Error ? err.message : "Failed to update report.";
    return { ok: false, error: msg };
  }
}
