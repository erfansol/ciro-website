"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, type AdminRole } from "@/lib/auth";
import { setUserDisabled, setUserRole } from "@/lib/userAdmin";

const VALID_ROLES = new Set(["admin", "moderator", "editor"]);

export type ActionResult = { ok: true } | { ok: false; error: string };

function readUid(formData: FormData): string {
  const v = formData.get("uid");
  if (typeof v !== "string" || v.length === 0) {
    throw new Error("Missing uid");
  }
  return v;
}

export async function suspendUserAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const uid = readUid(formData);
    const reason = (formData.get("reason") as string | null)?.trim() || undefined;
    await setUserDisabled(uid, true, session.uid, reason);
    revalidatePath(`/admin/users/${uid}`);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    console.error("[users/actions] suspend failed:", err);
    const msg = err instanceof Error ? err.message : "Failed to suspend user.";
    return { ok: false, error: msg };
  }
}

export async function restoreUserAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const uid = readUid(formData);
    await setUserDisabled(uid, false, session.uid);
    revalidatePath(`/admin/users/${uid}`);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    console.error("[users/actions] restore failed:", err);
    const msg = err instanceof Error ? err.message : "Failed to restore user.";
    return { ok: false, error: msg };
  }
}

export async function setRoleAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const uid = readUid(formData);
    const raw = formData.get("role");
    if (typeof raw !== "string") throw new Error("Missing role");
    const role: AdminRole | null =
      raw === "" ? null : VALID_ROLES.has(raw) ? (raw as AdminRole) : null;
    if (raw !== "" && role === null) throw new Error(`Invalid role: ${raw}`);
    await setUserRole(uid, role, session.uid);
    revalidatePath(`/admin/users/${uid}`);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    console.error("[users/actions] setRole failed:", err);
    const msg =
      err instanceof Error ? err.message : "Failed to update role.";
    return { ok: false, error: msg };
  }
}
