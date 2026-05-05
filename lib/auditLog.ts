import "server-only";
import { getAdminDb } from "./firebaseAdmin";
import { headers } from "next/headers";

export type AuditAction =
  | "story.create"
  | "story.update"
  | "story.delete"
  | "story.publish"
  | "story.unpublish"
  | "story.move"
  | "auth.signin"
  | "auth.signout"
  | "role.grant"
  | "role.revoke";

export type AuditEntry = {
  actorUid: string;
  action: AuditAction;
  targetCollection: string;
  targetId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
};

/**
 * Append-only audit trail of every admin write. Every server action
 * that touches user-visible Firestore data must call this so we have a
 * "who changed what" record for trust & safety / debugging.
 */
export async function logAdmin(entry: AuditEntry): Promise<void> {
  try {
    const h = await headers();
    await getAdminDb()
      .collection("auditLog")
      .add({
        ...entry,
        before: entry.before ?? null,
        after: entry.after ?? null,
        reason: entry.reason ?? null,
        ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: h.get("user-agent") ?? null,
        ts: new Date().toISOString(),
      });
  } catch (err) {
    // Audit failure must never break the admin action it logs.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[auditLog] write failed:", err);
    }
  }
}
