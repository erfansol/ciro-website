import "server-only";
import { getAdminAuth, getAdminDb } from "./firebaseAdmin";
import { logAdmin } from "./auditLog";

export type ReportStatus = "open" | "resolved" | "dismissed";

export type AdminReportRow = {
  id: string;
  reporterUid: string;
  reporterEmail: string | null;
  storyId: string | null;
  storyTitle: string | null;
  storyCity: string | null;
  reason: string | null;
  notes: string | null;
  status: ReportStatus;
  createdAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
};

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

function readStatus(v: unknown): ReportStatus {
  return v === "resolved" || v === "dismissed" ? v : "open";
}

/**
 * Fetch reports filtered by status. Joins each row with the reporter's
 * email via a single bulk Auth lookup so the moderation table can show
 * "who reported what" without N+1 calls.
 */
export async function listAdminReports(opts: {
  status?: ReportStatus;
  limit?: number;
}): Promise<AdminReportRow[]> {
  const status = opts.status ?? "open";
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);
  const db = getAdminDb();

  const snap = await db
    .collection("story_reports")
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get()
    .catch(() => null);
  if (!snap) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = snap.docs as Array<any>;

  const reporterUids = Array.from(
    new Set(
      docs
        .map((d) => d.data().reporterUid)
        .filter((u): u is string => typeof u === "string" && u.length > 0),
    ),
  );

  const emailByUid = new Map<string, string>();
  if (reporterUids.length > 0) {
    try {
      const lookup = await getAdminAuth().getUsers(
        reporterUids.map((uid) => ({ uid })),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lookup.users.forEach((u: any) => {
        if (typeof u.email === "string") emailByUid.set(u.uid, u.email);
      });
    } catch {
      // Non-fatal — table just shows uid where the email would be.
    }
  }

  return docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      reporterUid:
        typeof data.reporterUid === "string" ? data.reporterUid : "",
      reporterEmail: emailByUid.get(
        typeof data.reporterUid === "string" ? data.reporterUid : "",
      ) ?? null,
      storyId: typeof data.storyId === "string" ? data.storyId : null,
      storyTitle:
        typeof data.storyTitle === "string" ? data.storyTitle : null,
      storyCity: typeof data.storyCity === "string" ? data.storyCity : null,
      reason: typeof data.reason === "string" ? data.reason : null,
      notes: typeof data.notes === "string" ? data.notes : null,
      status: readStatus(data.status),
      createdAt: readTs(data.createdAt),
      resolvedAt: readTs(data.resolvedAt),
      resolvedBy:
        typeof data.resolvedBy === "string" ? data.resolvedBy : null,
      resolutionNotes:
        typeof data.resolutionNotes === "string"
          ? data.resolutionNotes
          : null,
    };
  });
}

export async function setReportStatus(
  id: string,
  status: "resolved" | "dismissed",
  actorUid: string,
  resolutionNotes?: string,
): Promise<void> {
  const ref = getAdminDb().collection("story_reports").doc(id);
  const before = await ref.get();
  if (!before.exists) {
    throw new Error(`Report ${id} not found`);
  }
  await ref.set(
    {
      status,
      resolvedBy: actorUid,
      resolvedAt: new Date().toISOString(),
      resolutionNotes:
        resolutionNotes && resolutionNotes.trim().length > 0
          ? resolutionNotes.trim()
          : null,
    },
    { merge: true },
  );
  await logAdmin({
    actorUid,
    action: status === "resolved" ? "report.resolve" : "report.dismiss",
    targetCollection: "story_reports",
    targetId: id,
    before: before.data() as Record<string, unknown> | undefined,
    after: { status },
    reason: resolutionNotes,
  });
}

export async function reportCounts(): Promise<{
  open: number;
  resolved: number;
  dismissed: number;
}> {
  const db = getAdminDb();
  // Count() aggregations require .count() — Firestore Admin v13 supports it.
  // Fallback to .get() length if .count is unavailable in the runtime.
  type CountableQuery = {
    count?: () => {
      get: () => Promise<{ data: () => { count?: number } }>;
    };
  };
  const counts = async (status: ReportStatus): Promise<number> => {
    try {
      const q = db.collection("story_reports").where("status", "==", status);
      const countable = q as unknown as CountableQuery;
      if (typeof countable.count === "function") {
        const agg = await countable.count().get();
        return Number(agg.data().count ?? 0);
      }
      const snap = await q.limit(500).get();
      return snap.size;
    } catch {
      return 0;
    }
  };

  const [open, resolved, dismissed] = await Promise.all([
    counts("open"),
    counts("resolved"),
    counts("dismissed"),
  ]);
  return { open, resolved, dismissed };
}
