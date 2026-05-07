import "server-only";
import { getAdminAuth, getAdminDb } from "./firebaseAdmin";
import { logAdmin } from "./auditLog";
import type { AdminRole } from "./auth";

const VALID_ROLES = new Set<AdminRole>(["admin", "moderator", "editor"]);

export type AdminUserRow = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string | null;
  lastSignInAt: string | null;
  role: AdminRole | null;
};

export type UserStatsSummary = {
  totalSteps: number;
  storiesCompleted: number;
  citiesVisited: number;
  currentCity: string | null;
  updatedAt: string | null;
};

export type AuditDisplayEntry = {
  id: string;
  action: string;
  actorUid: string;
  ts: string | null;
  reason: string | null;
};

export type AdminUserDetail = AdminUserRow & {
  stats: UserStatsSummary | null;
  recentAuditEntries: AuditDisplayEntry[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthUserLike = any;

function readRole(raw: unknown): AdminRole | null {
  return typeof raw === "string" && VALID_ROLES.has(raw as AdminRole)
    ? (raw as AdminRole)
    : null;
}

function mapAuthUser(u: AuthUserLike, role: AdminRole | null): AdminUserRow {
  return {
    uid: u.uid,
    email: typeof u.email === "string" ? u.email : null,
    displayName: typeof u.displayName === "string" ? u.displayName : null,
    photoURL: typeof u.photoURL === "string" ? u.photoURL : null,
    emailVerified: Boolean(u.emailVerified),
    disabled: Boolean(u.disabled),
    createdAt: u.metadata?.creationTime ?? null,
    lastSignInAt: u.metadata?.lastSignInTime ?? null,
    role,
  };
}

/**
 * Page through Firebase Auth users and join each with its `roles/{uid}`
 * role doc in a single bulk fetch. Sorted server-side by Auth's natural
 * order (uid lexicographic) — pageToken is opaque, we don't paginate by
 * email or createdAt.
 */
export async function listAdminUsers(opts: {
  pageToken?: string;
  pageSize?: number;
}): Promise<{ users: AdminUserRow[]; nextPageToken: string | null }> {
  const pageSize = Math.min(Math.max(opts.pageSize ?? 25, 1), 1000);
  const auth = getAdminAuth();
  const db = getAdminDb();

  const result = await auth.listUsers(pageSize, opts.pageToken);
  const uids = result.users.map((u: AuthUserLike) => u.uid);

  const roleSnaps = await Promise.all(
    uids.map((uid: string) => db.collection("roles").doc(uid).get()),
  );
  const roleByUid = new Map<string, AdminRole>();
  roleSnaps.forEach((snap, i) => {
    const role = readRole(snap.data()?.role);
    if (role) roleByUid.set(uids[i], role);
  });

  const users = result.users.map((u: AuthUserLike) =>
    mapAuthUser(u, roleByUid.get(u.uid) ?? null),
  );
  return { users, nextPageToken: result.pageToken ?? null };
}

export async function getAdminUserByEmail(
  email: string,
): Promise<AdminUserRow | null> {
  try {
    const u = await getAdminAuth().getUserByEmail(email);
    const roleSnap = await getAdminDb().collection("roles").doc(u.uid).get();
    return mapAuthUser(u, readRole(roleSnap.data()?.role));
  } catch {
    return null;
  }
}

export async function getAdminUser(
  uid: string,
): Promise<AdminUserDetail | null> {
  const auth = getAdminAuth();
  const db = getAdminDb();

  let authUser: AuthUserLike;
  try {
    authUser = await auth.getUser(uid);
  } catch {
    return null;
  }

  const [roleSnap, statsSnap, auditSnap] = await Promise.all([
    db.collection("roles").doc(uid).get(),
    db.collection("users").doc(uid).collection("stats").doc("summary").get(),
    db
      .collection("auditLog")
      .where("targetId", "==", uid)
      .orderBy("ts", "desc")
      .limit(20)
      .get()
      // Missing composite index returns FAILED_PRECONDITION; treat as empty.
      .catch(() => null),
  ]);

  const role = readRole(roleSnap.data()?.role);

  const statsRaw = statsSnap.exists
    ? (statsSnap.data() as Record<string, unknown>)
    : null;
  const stats: UserStatsSummary | null = statsRaw
    ? {
        totalSteps: Number(statsRaw.totalSteps ?? 0),
        storiesCompleted: Array.isArray(statsRaw.storiesCompleted)
          ? statsRaw.storiesCompleted.length
          : 0,
        citiesVisited:
          statsRaw.citiesVisited && typeof statsRaw.citiesVisited === "object"
            ? Object.keys(statsRaw.citiesVisited as object).length
            : 0,
        currentCity:
          typeof statsRaw.currentCity === "string"
            ? statsRaw.currentCity
            : null,
        updatedAt: readTs(statsRaw.updatedAt),
      }
    : null;

  const recentAuditEntries: AuditDisplayEntry[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    auditSnap?.docs.map((d: any) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        action: typeof data.action === "string" ? data.action : "(unknown)",
        actorUid: typeof data.actorUid === "string" ? data.actorUid : "",
        ts: typeof data.ts === "string" ? data.ts : null,
        reason: typeof data.reason === "string" ? data.reason : null,
      };
    }) ?? [];

  return {
    ...mapAuthUser(authUser, role),
    stats,
    recentAuditEntries,
  };
}

function readTs(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (
    v &&
    typeof v === "object" &&
    "toDate" in v &&
    typeof (v as { toDate: () => Date }).toDate === "function"
  ) {
    try {
      return (v as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

/** Suspend or restore an Auth user. Audit entry recorded regardless. */
export async function setUserDisabled(
  uid: string,
  disabled: boolean,
  actorUid: string,
  reason?: string,
): Promise<void> {
  if (uid === actorUid) {
    // Refuse self-lockout. Avoids "I disabled myself and now no one can
    // re-enable me" without another admin to call.
    throw new Error("You can't suspend your own account.");
  }
  await getAdminAuth().updateUser(uid, { disabled });
  await logAdmin({
    actorUid,
    action: disabled ? "user.suspend" : "user.restore",
    targetCollection: "users",
    targetId: uid,
    reason: reason ?? undefined,
  });
}

/**
 * Set or clear a role on `roles/{uid}`. Passing null deletes the doc
 * (revoking all admin access). Audit entry mirrors the change.
 */
export async function setUserRole(
  uid: string,
  role: AdminRole | null,
  actorUid: string,
): Promise<void> {
  if (uid === actorUid && role !== "admin") {
    // Same self-lockout protection: don't let an admin demote themselves
    // and lose access to /admin in the same click.
    throw new Error("You can't change your own role here.");
  }
  const ref = getAdminDb().collection("roles").doc(uid);
  if (role === null) {
    await ref.delete().catch(() => undefined);
    await logAdmin({
      actorUid,
      action: "role.revoke",
      targetCollection: "roles",
      targetId: uid,
    });
  } else {
    const now = new Date().toISOString();
    const before = await ref.get();
    await ref.set(
      {
        role,
        grantedBy: actorUid,
        grantedAt: before.exists
          ? (before.data()?.grantedAt ?? now)
          : now,
        updatedAt: now,
      },
      { merge: true },
    );
    await logAdmin({
      actorUid,
      action: "role.grant",
      targetCollection: "roles",
      targetId: uid,
      before: before.data() as Record<string, unknown> | undefined,
      after: { role },
    });
  }
}
