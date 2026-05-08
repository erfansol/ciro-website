import "server-only";
import { getAdminAuth, getAdminDb } from "./firebaseAdmin";

const MAX_EVENT_READ = 5000;

export type AnalyticsSummary = {
  totalUsers: number | null; // null = could not enumerate (cap reached)
  totalUsersIsCap: boolean;
  totalStories: number;
  openReports: number;
  totalReports: number;
  views30d: number;
  views7d: number;
  views24h: number;
  uniqueUsers30d: number;
  uniqueUsers7d: number;
  uniqueUsers24h: number;
  // Cardinality of story_views collection at the time of query (with
  // a cap — see MAX_EVENT_READ). Useful as a sanity check.
  totalViews: number;
  totalViewsIsCap: boolean;
};

export type RankedRow = {
  key: string;
  label: string;
  count: number;
};

export type DailyBucket = {
  date: string; // YYYY-MM-DD
  count: number;
};

export type AdminFeedEntry = {
  id: string;
  action: string;
  actorUid: string;
  targetCollection: string;
  targetId: string;
  ts: string | null;
  reason: string | null;
};

export type AnalyticsBundle = {
  summary: AnalyticsSummary;
  topStories: RankedRow[];
  topCities: RankedRow[];
  topReportReasons: RankedRow[];
  daily30d: DailyBucket[];
  recentAdmin: AdminFeedEntry[];
  generatedAt: string;
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function readTs(v: unknown): Date | null {
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (
    v &&
    typeof v === "object" &&
    "toDate" in v &&
    typeof (v as { toDate: () => Date }).toDate === "function"
  ) {
    try {
      return (v as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

async function safeCount(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  fallbackLimit = 1000,
): Promise<{ count: number; isCap: boolean }> {
  try {
    if (typeof query.count === "function") {
      const agg = await query.count().get();
      return { count: Number(agg.data().count ?? 0), isCap: false };
    }
  } catch {
    // fall through
  }
  try {
    const snap = await query.limit(fallbackLimit).get();
    return { count: snap.size, isCap: snap.size === fallbackLimit };
  } catch {
    return { count: 0, isCap: false };
  }
}

async function totalAuthUsers(): Promise<{
  count: number;
  isCap: boolean;
}> {
  // Auth has no count API; iterate up to a hard cap.
  const auth = getAdminAuth();
  const CAP = 1000;
  let count = 0;
  let pageToken: string | undefined;
  while (count < CAP) {
    const result = await auth.listUsers(
      Math.min(1000, CAP - count),
      pageToken,
    );
    count += result.users.length;
    if (!result.pageToken) break;
    pageToken = result.pageToken;
  }
  return { count, isCap: count >= CAP };
}

/**
 * Pull every story_views doc from the last [days] up to MAX_EVENT_READ
 * and roll the slice into the metrics the analytics page needs. Cheap
 * enough at our scale; if it ever isn't, swap to a daily aggregator
 * Cloud Function that writes `dailyMetrics/{yyyy-mm-dd}`.
 */
export async function loadAnalytics(): Promise<AnalyticsBundle> {
  const db = getAdminDb();
  const since30 = daysAgo(30);
  const since7 = daysAgo(7);
  const since1 = daysAgo(1);

  const [
    storiesCount,
    openReportsCount,
    totalReportsCount,
    totalViewsCount,
    authUsers,
    viewsSnap,
    reportsSnap,
    auditSnap,
  ] = await Promise.all([
    safeCount(db.collection("stories"), 1000),
    safeCount(
      db.collection("story_reports").where("status", "==", "open"),
      500,
    ),
    safeCount(db.collection("story_reports"), 5000),
    safeCount(db.collection("story_views"), MAX_EVENT_READ),
    totalAuthUsers(),
    db
      .collection("story_views")
      .where("viewedAt", ">=", since30)
      .orderBy("viewedAt", "desc")
      .limit(MAX_EVENT_READ)
      .get()
      .catch(() => null),
    db
      .collection("story_reports")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get()
      .catch(() => null),
    db
      .collection("auditLog")
      .orderBy("ts", "desc")
      .limit(15)
      .get()
      .catch(() => null),
  ]);

  // Process views ────────────────────────────────────────────────
  let views30d = 0;
  let views7d = 0;
  let views24h = 0;
  const uniq30 = new Set<string>();
  const uniq7 = new Set<string>();
  const uniq24 = new Set<string>();
  const storyCount = new Map<string, { id: string; title: string; n: number }>();
  const cityCount = new Map<string, number>();
  const dailyMap = new Map<string, number>();

  // Pre-seed daily buckets for last 30 days so empty days render as 0.
  for (let i = 29; i >= 0; i--) {
    dailyMap.set(isoDate(daysAgo(i)), 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewsSnap?.docs.forEach((d: any) => {
    const data = d.data() as Record<string, unknown>;
    const ts = readTs(data.viewedAt);
    if (!ts) return;
    const uid = typeof data.userUid === "string" ? data.userUid : "";
    const storyId = typeof data.storyId === "string" ? data.storyId : "";
    const title =
      typeof data.storyTitle === "string" && data.storyTitle.length > 0
        ? data.storyTitle
        : storyId || "(unknown)";
    const city =
      typeof data.storyCity === "string" && data.storyCity.length > 0
        ? data.storyCity
        : "(unknown)";

    views30d += 1;
    uniq30.add(uid);
    if (ts >= since7) {
      views7d += 1;
      uniq7.add(uid);
    }
    if (ts >= since1) {
      views24h += 1;
      uniq24.add(uid);
    }

    if (storyId) {
      const cur = storyCount.get(storyId) ?? { id: storyId, title, n: 0 };
      cur.title = title; // Refresh in case earlier doc had stale denorm.
      cur.n += 1;
      storyCount.set(storyId, cur);
    }
    cityCount.set(city, (cityCount.get(city) ?? 0) + 1);

    const dKey = isoDate(ts);
    if (dailyMap.has(dKey)) {
      dailyMap.set(dKey, (dailyMap.get(dKey) ?? 0) + 1);
    }
  });

  const topStories: RankedRow[] = Array.from(storyCount.values())
    .sort((a, b) => b.n - a.n)
    .slice(0, 10)
    .map((s) => ({ key: s.id, label: s.title, count: s.n }));

  const topCities: RankedRow[] = Array.from(cityCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k, n]) => ({ key: k, label: k, count: n }));

  const daily30d: DailyBucket[] = Array.from(dailyMap.entries()).map(
    ([date, count]) => ({ date, count }),
  );

  // Process reports ──────────────────────────────────────────────
  const reasonCount = new Map<string, number>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportsSnap?.docs.forEach((d: any) => {
    const data = d.data() as Record<string, unknown>;
    const reason = typeof data.reason === "string" ? data.reason : "other";
    reasonCount.set(reason, (reasonCount.get(reason) ?? 0) + 1);
  });
  const topReportReasons: RankedRow[] = Array.from(reasonCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => ({ key: k, label: k, count: n }));

  // Recent admin feed ────────────────────────────────────────────
  const recentAdmin: AdminFeedEntry[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    auditSnap?.docs.map((d: any) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        action: typeof data.action === "string" ? data.action : "(unknown)",
        actorUid: typeof data.actorUid === "string" ? data.actorUid : "",
        targetCollection:
          typeof data.targetCollection === "string"
            ? data.targetCollection
            : "",
        targetId: typeof data.targetId === "string" ? data.targetId : "",
        ts: typeof data.ts === "string" ? data.ts : null,
        reason: typeof data.reason === "string" ? data.reason : null,
      };
    }) ?? [];

  return {
    summary: {
      totalUsers: authUsers.isCap ? null : authUsers.count,
      totalUsersIsCap: authUsers.isCap,
      totalStories: storiesCount.count,
      openReports: openReportsCount.count,
      totalReports: totalReportsCount.count,
      views30d,
      views7d,
      views24h,
      uniqueUsers30d: uniq30.size - (uniq30.has("") ? 1 : 0),
      uniqueUsers7d: uniq7.size - (uniq7.has("") ? 1 : 0),
      uniqueUsers24h: uniq24.size - (uniq24.has("") ? 1 : 0),
      totalViews: totalViewsCount.count,
      totalViewsIsCap: totalViewsCount.isCap,
    },
    topStories,
    topCities,
    topReportReasons,
    daily30d,
    recentAdmin,
    generatedAt: new Date().toISOString(),
  };
}
