import { NextResponse } from "next/server";
import { destroyAdminSession, getCurrentAdmin } from "@/lib/auth";
import { logAdmin } from "@/lib/auditLog";
import { SITE } from "@/lib/seo";

export const runtime = "nodejs";

/**
 * Sign-out endpoint posted to from the sidebar form. Best-effort audit
 * log, then clears the session cookie and redirects to /admin/login.
 */
export async function POST() {
  const session = await getCurrentAdmin().catch(() => null);
  if (session) {
    await logAdmin({
      actorUid: session.uid,
      action: "auth.signout",
      targetCollection: "users",
      targetId: session.uid,
    });
  }
  await destroyAdminSession();
  return NextResponse.redirect(new URL("/admin/login", SITE.url), { status: 303 });
}
