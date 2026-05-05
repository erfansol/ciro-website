import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth, getAdminDb } from "./firebaseAdmin";

const COOKIE_NAME = "ciro_admin_session";
const COOKIE_MAX_AGE_DAYS = 5;
const COOKIE_MAX_AGE_MS = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export type AdminRole = "admin" | "moderator" | "editor";

export type AdminSession = {
  uid: string;
  email: string | null;
  role: AdminRole;
};

const VALID_ROLES = new Set<AdminRole>(["admin", "moderator", "editor"]);

/**
 * Exchange a Firebase ID token (from the browser sign-in) for a
 * server-managed session cookie. Refuses to set a cookie unless the
 * user has a `roles/{uid}` doc with a recognised role — that's the
 * single source of truth for who can access the dashboard.
 */
export async function createAdminSession(
  idToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken, true);
  } catch {
    return { ok: false, error: "Invalid or expired sign-in token." };
  }

  const role = await loadRole(decoded.uid);
  if (!role) {
    return {
      ok: false,
      error:
        "This account is not authorised for the Ciro admin. Ask an existing admin to grant you a role.",
    };
  }

  let sessionCookie: string;
  try {
    sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: COOKIE_MAX_AGE_MS,
    });
  } catch {
    return { ok: false, error: "Could not establish session. Try again." };
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_MS / 1000,
  });

  return { ok: true };
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/**
 * Returns the current admin session, or null if the cookie is missing,
 * expired, revoked, or the user no longer has a role doc. Never throws.
 */
export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookie, true);
    const role = await loadRole(decoded.uid);
    if (!role) return null;
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role,
    };
  } catch {
    return null;
  }
}

/** Server-component helper: redirects to /admin/login if no session. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getCurrentAdmin();
  if (!session) redirect("/admin/login");
  return session;
}

/** Server-action helper: enforces a specific subset of roles. */
export async function requireRole(roles: AdminRole[]): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!roles.includes(session.role)) {
    throw new Error(`Forbidden: requires role ${roles.join(" | ")}`);
  }
  return session;
}

async function loadRole(uid: string): Promise<AdminRole | null> {
  const doc = await getAdminDb().collection("roles").doc(uid).get();
  if (!doc.exists) return null;
  const data = doc.data() as { role?: unknown } | undefined;
  const role = data?.role;
  return typeof role === "string" && VALID_ROLES.has(role as AdminRole)
    ? (role as AdminRole)
    : null;
}
