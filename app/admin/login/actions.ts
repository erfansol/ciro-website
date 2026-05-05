"use server";

import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/auth";
import { logAdmin } from "@/lib/auditLog";
import { getAdminAuth } from "@/lib/firebaseAdmin";

/**
 * Server-side counterpart to the client sign-in form. The browser
 * Firebase SDK does the password check (so the admin server never sees
 * the password); the resulting ID token is POSTed here, verified, and
 * exchanged for a session cookie. Authorisation is gated by the
 * `roles/{uid}` doc — see lib/auth.ts.
 */
export async function signInAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const idToken = formData.get("idToken");
  if (typeof idToken !== "string" || idToken.length < 20) {
    return { ok: false, error: "Missing sign-in token." };
  }

  const result = await createAdminSession(idToken);
  if (!result.ok) return result;

  // Best-effort audit; auth.signin records who logged in and when.
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    await logAdmin({
      actorUid: decoded.uid,
      action: "auth.signin",
      targetCollection: "users",
      targetId: decoded.uid,
    });
  } catch {
    // ignore — sign-in still succeeded
  }

  return { ok: true };
}

export async function signOutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
