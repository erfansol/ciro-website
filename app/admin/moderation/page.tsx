import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  listAdminReports,
  reportCounts,
  type ReportStatus,
} from "@/lib/reportsAdmin";
import { ReportRowActions } from "@/components/admin/ReportRow";

export const dynamic = "force-dynamic";

const TABS: ReportStatus[] = ["open", "resolved", "dismissed"];

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status: statusParam } = await searchParams;
  const status: ReportStatus = (TABS as string[]).includes(statusParam ?? "")
    ? (statusParam as ReportStatus)
    : "open";

  const [reports, counts] = await Promise.all([
    listAdminReports({ status, limit: 100 }),
    reportCounts(),
  ]);

  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.32em] text-admin-text-subtle">
          Trust &amp; safety
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-admin-text">
          Moderation
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-admin-text-muted">
          User-submitted reports against stories. Reports are written by the
          Flutter app to <code className="text-admin-text-muted">story_reports/</code>;
          resolutions are recorded in
          <code className="text-admin-text-muted"> auditLog/</code>.
        </p>
      </header>

      <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]">
        {TABS.map((t) => {
          const active = t === status;
          const count =
            t === "open"
              ? counts.open
              : t === "resolved"
                ? counts.resolved
                : counts.dismissed;
          return (
            <Link
              key={t}
              href={`/admin/moderation?status=${t}`}
              className={
                active
                  ? "rounded-md border border-admin-border-strong bg-admin-surface-2 px-3 py-1.5 text-admin-text"
                  : "rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 text-admin-text-muted transition-colors hover:border-admin-border-strong hover:text-admin-text"
              }
            >
              {t} <span className="ml-1 text-admin-text-subtle">{count}</span>
            </Link>
          );
        })}
      </nav>

      {reports.length === 0 ? (
        <p className="rounded-md border border-admin-border bg-admin-surface p-8 text-sm text-admin-text-muted">
          {status === "open"
            ? "No open reports. Nothing to triage right now."
            : `No ${status} reports.`}
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-admin-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-surface text-[10px] uppercase tracking-[0.2em] text-admin-text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Reported</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Reporter</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {reports.map((r) => (
                <tr key={r.id} className="bg-admin-surface-strong/40">
                  <td className="px-4 py-3 align-top">
                    {r.storyId ? (
                      <Link
                        href={`/admin/stories/${r.storyId}`}
                        className="font-display text-[15px] tracking-tight  text-admin-text hover:underline"
                      >
                        {r.storyTitle ?? "(untitled)"}
                      </Link>
                    ) : (
                      <span className="font-display text-[15px] tracking-tight text-admin-text">
                        {r.storyTitle ?? "(untitled)"}
                      </span>
                    )}
                    <p className="mt-0.5 truncate text-xs text-admin-text-subtle">
                      {r.storyCity ?? "—"} · {r.storyId ?? "no story id"}
                    </p>
                    {r.notes && (
                      <p className="mt-1 max-w-md text-xs text-admin-text-muted">
                        &ldquo;{r.notes}&rdquo;
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-200">
                      {r.reason ?? "other"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/users/${r.reporterUid}`}
                      className="text-admin-text hover:underline"
                    >
                      {r.reporterEmail ?? r.reporterUid}
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-admin-text-muted">
                    {formatRelative(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {status === "open" ? (
                      <ReportRowActions id={r.id} />
                    ) : (
                      <div className="text-[11px] text-admin-text-subtle">
                        <span className="block">
                          {r.status} {r.resolvedAt && `· ${formatRelative(r.resolvedAt)}`}
                        </span>
                        {r.resolutionNotes && (
                          <span className="block text-admin-text-muted">
                            &ldquo;{r.resolutionNotes}&rdquo;
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
