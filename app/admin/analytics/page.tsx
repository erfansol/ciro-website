import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { loadAnalytics, type DailyBucket } from "@/lib/analyticsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const data = await loadAnalytics();

  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.32em] text-admin-text-subtle">
          Insights
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-admin-text">
          Analytics
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-admin-text-muted">
          Live rollups computed from{" "}
          <code className="text-admin-text">story_views/</code>,{" "}
          <code className="text-admin-text">story_reports/</code>, and the Auth
          user list. Updated on every page load — generated{" "}
          <span className="text-admin-text">
            {formatTime(data.generatedAt)}
          </span>
          .
        </p>
      </header>

      {/* KPI cards */}
      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Users"
          value={
            data.summary.totalUsers === null
              ? `${data.summary.totalUsersIsCap ? "1000+" : "—"}`
              : data.summary.totalUsers.toLocaleString()
          }
          hint="Firebase Auth"
        />
        <Stat
          label="Stories"
          value={data.summary.totalStories.toLocaleString()}
          hint="stories/"
        />
        <Stat
          label="Open reports"
          value={data.summary.openReports.toLocaleString()}
          hint={`of ${data.summary.totalReports.toLocaleString()} total`}
          accent={data.summary.openReports > 0 ? "amber" : undefined}
          href="/admin/moderation"
        />
        <Stat
          label="Total views"
          value={`${data.summary.totalViewsIsCap ? "5000+" : data.summary.totalViews.toLocaleString()}`}
          hint="story_views/"
        />
        <Stat
          label="Views · 24h"
          value={data.summary.views24h.toLocaleString()}
          hint={`${data.summary.uniqueUsers24h} unique users`}
        />
        <Stat
          label="Views · 7d"
          value={data.summary.views7d.toLocaleString()}
          hint={`${data.summary.uniqueUsers7d} WAU`}
        />
        <Stat
          label="Views · 30d"
          value={data.summary.views30d.toLocaleString()}
          hint={`${data.summary.uniqueUsers30d} MAU`}
        />
        <Stat
          label="Avg views / day"
          value={Math.round(data.summary.views30d / 30).toLocaleString()}
          hint="rolling 30-day mean"
        />
      </section>

      {/* Daily chart */}
      <section className="mb-8 rounded-md border border-admin-border bg-admin-surface p-5">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
          Story views — last 30 days
        </h2>
        <DailyBars buckets={data.daily30d} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top stories */}
        <Panel
          title="Top stories"
          subtitle="by views in last 30 days"
          empty="No views yet — once the Flutter app starts logging story_views/ events, they'll rank here."
          rows={data.topStories.map((r) => ({
            key: r.key,
            primary: (
              <Link
                href={`/admin/stories/${r.key}`}
                className="hover:underline"
              >
                {r.label}
              </Link>
            ),
            secondary: r.key,
            count: r.count,
          }))}
        />

        {/* Top cities */}
        <Panel
          title="Top cities"
          subtitle="by views in last 30 days"
          empty="No views yet."
          rows={data.topCities.map((r) => ({
            key: r.key,
            primary: r.label,
            secondary: null,
            count: r.count,
          }))}
        />

        {/* Report reasons */}
        <Panel
          title="Report reasons"
          subtitle="across all reports"
          empty="No reports yet."
          rows={data.topReportReasons.map((r) => ({
            key: r.key,
            primary: r.label,
            secondary: null,
            count: r.count,
          }))}
        />

        {/* Recent admin activity */}
        <section className="rounded-md border border-admin-border bg-admin-surface p-5">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
            Recent admin activity
          </h2>
          <p className="mt-1 text-[11px] text-admin-text-faint">
            From auditLog/. Newest first.
          </p>
          {data.recentAdmin.length === 0 ? (
            <p className="mt-4 text-sm text-admin-text-muted">
              No admin actions recorded yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {data.recentAdmin.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start justify-between gap-3 border-l border-admin-border pl-3"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] text-admin-text">
                      {e.action}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-admin-text-faint">
                      {e.targetCollection}/{e.targetId}
                    </p>
                    {e.reason && (
                      <p className="mt-0.5 text-xs text-admin-text-muted">
                        {e.reason}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-admin-text-subtle">
                    {formatRelative(e.ts)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-8 max-w-prose text-[11px] text-admin-text-faint">
        Numbers above are computed from up to 5,000 most-recent{" "}
        <code className="text-admin-text-muted">story_views/</code> docs and 500
        most-recent{" "}
        <code className="text-admin-text-muted">story_reports/</code>. At
        higher scale, swap to a daily aggregator Cloud Function that writes{" "}
        <code className="text-admin-text-muted">
          dailyMetrics/&#123;yyyy-mm-dd&#125;
        </code>{" "}
        and read from there. Heatmap of user activity is deferred until
        Firebase Analytics → BigQuery export is enabled.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "amber";
  href?: string;
}) {
  const baseCls =
    "block rounded-md border bg-admin-surface p-4 transition-colors " +
    (accent === "amber"
      ? "border-amber-400/30 hover:border-amber-400/50"
      : "border-admin-border hover:border-admin-border-strong");
  const inner = (
    <>
      <p className="text-[10px] uppercase tracking-[0.22em] text-admin-text-subtle">
        {label}
      </p>
      <p
        className={
          "mt-2 font-display text-2xl tabular-nums " +
          (accent === "amber" ? "text-amber-200" : "text-admin-text")
        }
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[11px] text-admin-text-faint">{hint}</p>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={baseCls}>
        {inner}
      </Link>
    );
  }
  return <div className={baseCls}>{inner}</div>;
}

function DailyBars({ buckets }: { buckets: DailyBucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="mt-4">
      <div className="flex h-32 items-end gap-1">
        {buckets.map((b) => {
          const h = (b.count / max) * 100;
          return (
            <div
              key={b.date}
              className="group relative flex-1"
              title={`${b.date}: ${b.count} views`}
            >
              <div
                className="rounded-sm bg-admin-text/70 transition-colors group-hover:bg-admin-text"
                style={{ height: `${Math.max(2, h)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-admin-text-faint">
        <span>{buckets[0]?.date}</span>
        <span className="text-admin-text-subtle">
          peak {max.toLocaleString()}/day
        </span>
        <span>{buckets[buckets.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  empty,
  rows,
}: {
  title: string;
  subtitle: string;
  empty: string;
  rows: Array<{
    key: string;
    primary: React.ReactNode;
    secondary: React.ReactNode | null;
    count: number;
  }>;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="rounded-md border border-admin-border bg-admin-surface p-5">
      <h2 className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
        {title}
      </h2>
      <p className="mt-1 text-[11px] text-admin-text-faint">{subtitle}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-admin-text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {rows.map((r) => {
            const w = (r.count / max) * 100;
            return (
              <li key={r.key} className="text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0 truncate text-admin-text">
                    {r.primary}
                    {r.secondary && (
                      <span className="ml-2 text-[11px] text-admin-text-faint">
                        {r.secondary}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 tabular-nums text-admin-text-muted">
                    {r.count.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-admin-surface-2">
                  <div
                    className="h-full bg-admin-text/55"
                    style={{ width: `${w}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 30 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toISOString().slice(0, 10);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}
