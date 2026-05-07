import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminUserByEmail, listAdminUsers } from "@/lib/userAdmin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ pageToken?: string; q?: string }>;
}) {
  await requireAdmin();
  const { pageToken, q } = await searchParams;
  const search = q?.trim() ?? "";

  if (search.includes("@")) {
    const u = await getAdminUserByEmail(search);
    if (u) redirect(`/admin/users/${u.uid}`);
  }

  const { users, nextPageToken } = await listAdminUsers({
    pageToken,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
            Accounts
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-white">
            Users
          </h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/55">
            Firebase Auth users in <code className="text-white/70">ciro-app-41f02</code>.
            Suspend disables their sign-in via the Auth <code className="text-white/70">disabled</code> flag;
            roles live in <code className="text-white/70">roles/&#123;uid&#125;</code>.
          </p>
        </div>
        <form action="/admin/users" method="get" className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="email@example.com"
            className="w-64 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            Find
          </button>
        </form>
      </header>

      {search && !search.includes("@") && (
        <p className="mb-4 rounded-md border border-amber-400/20 bg-amber-400/[0.05] px-4 py-2 text-xs text-amber-200/80">
          Search currently matches whole emails only. Type a full address.
        </p>
      )}

      <div className="overflow-hidden rounded-md border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-white/45">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {users.map((u) => (
              <tr
                key={u.uid}
                className="bg-[#0a0d16]/40 transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${u.uid}`}
                    className="font-display text-[15px] tracking-tight text-white hover:underline"
                  >
                    {u.email ?? "(no email)"}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-white/40">{u.uid}</p>
                </td>
                <td className="px-4 py-3">
                  {u.role ? (
                    <span className="rounded-full border border-sky-400/30 bg-sky-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-sky-200">
                      {u.role}
                    </span>
                  ) : (
                    <span className="text-xs text-white/35">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.disabled ? (
                    <span className="rounded-full border border-rose-400/30 bg-rose-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-rose-300">
                      Suspended
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-white/55">
                  {formatRelative(u.lastSignInAt)}
                </td>
                <td className="px-4 py-3 text-xs text-white/55">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.uid}`}
                    className="text-xs uppercase tracking-[0.22em] text-white/55 hover:text-white"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-white/45">
                  No users in this page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/45">
        <span>Showing up to {PAGE_SIZE} per page · cursor-paginated</span>
        {nextPageToken ? (
          <Link
            href={`/admin/users?pageToken=${encodeURIComponent(nextPageToken)}`}
            className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 uppercase tracking-[0.22em] hover:border-white/30 hover:text-white"
          >
            Next page →
          </Link>
        ) : (
          <span className="text-white/30">End of list</span>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "never";
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 30 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toISOString().slice(0, 10);
}
