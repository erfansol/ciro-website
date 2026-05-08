import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAdminStories } from "@/lib/storyAdmin";
import { formatBytes, listStoryMediaSummaries } from "@/lib/mediaAdmin";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdmin();
  const [stories, summaries] = await Promise.all([
    listAdminStories(),
    listStoryMediaSummaries(),
  ]);

  // Keys present in either source so empty stories still appear, and any
  // orphan storage prefixes (without a matching story doc) are visible.
  const allIds = Array.from(
    new Set<string>([
      ...stories.map((s) => s.id),
      ...summaries.map((s) => s.storyId),
    ]),
  ).sort();

  const summaryByStory = new Map(summaries.map((s) => [s.storyId, s]));
  const titleByStory = new Map(stories.map((s) => [s.id, s.title]));
  const grandTotalBytes = summaries.reduce((n, s) => n + s.totalBytes, 0);
  const grandTotalFiles = summaries.reduce((n, s) => n + s.fileCount, 0);

  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.32em] text-admin-text-subtle">
          Assets
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-admin-text">
          Media library
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-admin-text-muted">
          Per-story media stored at{" "}
          <code className="text-admin-text-muted">stories/&#123;id&#125;/</code> in
          Firebase Storage. Click into a story to upload or delete files.
          {grandTotalFiles > 0 && (
            <>
              {" "}
              {grandTotalFiles} files across {summaries.length} stories ·
              {" "}
              {formatBytes(grandTotalBytes)} total.
            </>
          )}
        </p>
      </header>

      <div className="overflow-hidden rounded-md border border-admin-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-admin-surface text-[10px] uppercase tracking-[0.2em] text-admin-text-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Story</th>
              <th className="px-4 py-3 font-medium">Files</th>
              <th className="px-4 py-3 font-medium">Total size</th>
              <th className="px-4 py-3 font-medium">Last upload</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {allIds.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-admin-text-subtle">
                  No stories yet.
                </td>
              </tr>
            )}
            {allIds.map((id) => {
              const summary = summaryByStory.get(id);
              const title = titleByStory.get(id);
              const orphan = !title;
              return (
                <tr key={id} className="bg-admin-surface-strong/40 transition-colors hover:bg-admin-surface">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/stories/${id}/media`}
                      className="font-display text-[15px] tracking-tight  text-admin-text hover:underline"
                    >
                      {title ?? id}
                    </Link>
                    <p className="mt-0.5 text-xs text-admin-text-subtle">
                      {id}
                      {orphan && (
                        <span className="ml-2 rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-200">
                          orphan
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-admin-text tabular-nums">
                    {summary?.fileCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-admin-text tabular-nums">
                    {summary ? formatBytes(summary.totalBytes) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-admin-text-muted">
                    {formatRelative(summary?.lastUploadedAt ?? null)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/stories/${id}/media`}
                      className="text-xs uppercase tracking-[0.22em] text-admin-text-muted hover:text-admin-text"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-[11px] text-admin-text-faint">
        Orphan rows mean files exist under{" "}
        <code className="text-admin-text-muted">stories/&lt;id&gt;/</code> but no matching{" "}
        <code className="text-admin-text-muted">stories/&#123;id&#125;</code> Firestore doc was
        found — usually leftover from a renamed/deleted story. Clean them up
        from inside the matching media page.
      </p>
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
