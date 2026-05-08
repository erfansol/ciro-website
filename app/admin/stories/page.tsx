import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAdminStories } from "@/lib/storyAdmin";
import { CATEGORY_BY_ID } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage() {
  await requireAdmin();
  const stories = await listAdminStories();

  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-admin-text-subtle">
            Library · {stories.length} stories
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-admin-text">
            Stories
          </h1>
        </div>
        <Link
          href="/admin/world"
          className="inline-flex items-center gap-2 rounded-md border border-admin-border-strong bg-admin-surface px-4 py-2 text-xs uppercase tracking-[0.22em] text-admin-text-muted transition-colors hover:border-admin-border-strong hover:text-admin-text"
        >
          Open world map
        </Link>
      </header>

      {stories.length === 0 ? (
        <p className="rounded-md border border-admin-border bg-admin-surface p-8 text-sm text-admin-text-muted">
          No stories yet. Documents in the Firestore <code>stories/</code>{" "}
          collection will appear here.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-admin-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-surface text-[10px] uppercase tracking-[0.2em] text-admin-text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Coords</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {stories.map((s) => {
                const cat = CATEGORY_BY_ID[s.category];
                const coords =
                  s.lat !== undefined && s.lon !== undefined
                    ? `${s.lat.toFixed(3)}, ${s.lon.toFixed(3)}`
                    : "—";
                return (
                  <tr
                    key={s.id}
                    className="bg-admin-surface-strong/40 transition-colors hover:bg-admin-surface"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/stories/${s.id}`}
                        className="font-display text-[15px] tracking-tight  text-admin-text hover:underline"
                      >
                        {s.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-admin-text-subtle">
                        {s.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-admin-text">{s.city}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: cat.color }}
                        />
                        <span className="text-admin-text">{cat.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.published ? (
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                          Published
                        </span>
                      ) : (
                        <span className="rounded-full border border-admin-border-strong bg-admin-surface px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-admin-text-muted">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums text-admin-text-muted">
                      {coords}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/stories/${s.id}`}
                        className="text-xs uppercase tracking-[0.22em] text-admin-text-muted hover:text-admin-text"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
