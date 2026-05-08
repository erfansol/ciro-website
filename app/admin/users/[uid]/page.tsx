import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminUser, type ActivityEntry } from "@/lib/userAdmin";
import { UserActions } from "@/components/admin/UserActions";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const session = await requireAdmin();
  const { uid } = await params;
  const user = await getAdminUser(uid);
  if (!user) notFound();

  const isSelf = uid === session.uid;

  return (
    <div className="px-8 py-8 lg:px-12">
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-[11px] uppercase tracking-[0.22em] text-white/45 hover:text-white"
        >
          ← All users
        </Link>
      </div>

      {/* Profile header */}
      <header className="mb-8 flex items-start gap-5">
        <Avatar email={user.email} photoURL={user.photoURL} />
        <div className="flex-1">
          <h1 className="font-display text-2xl tracking-tight text-white">
            {user.displayName || user.email || "(no name)"}
          </h1>
          <p className="mt-1 text-sm text-white/70">{user.email ?? "(no email)"}</p>
          <p className="mt-1 truncate font-mono text-[11px] text-white/35">{user.uid}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {user.role && (
              <span className="rounded-full border border-sky-400/30 bg-sky-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-sky-200">
                {user.role}
              </span>
            )}
            {user.disabled ? (
              <span className="rounded-full border border-rose-400/30 bg-rose-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-rose-300">
                Suspended
              </span>
            ) : (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                Active
              </span>
            )}
            {!user.emailVerified && (
              <span className="rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-200">
                Unverified email
              </span>
            )}
            {isSelf && (
              <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/55">
                You
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: stats + activity */}
        <div className="space-y-6">
          <section className="rounded-md border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-white/45">
              Account
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
              <Field label="Created">{formatDate(user.createdAt)}</Field>
              <Field label="Last sign-in">{formatRelative(user.lastSignInAt)}</Field>
            </dl>
          </section>

          <section className="rounded-md border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-white/45">
              In-app stats
            </h2>
            {user.stats ? (
              <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
                <Field label="Total steps">
                  {user.stats.totalSteps.toLocaleString()}
                </Field>
                <Field label="Stories completed">
                  {user.stats.storiesCompleted}
                </Field>
                <Field label="Cities visited">{user.stats.citiesVisited}</Field>
                <Field label="Current city">
                  {user.stats.currentCity ?? "—"}
                </Field>
                <Field label="Stats updated">
                  {formatRelative(user.stats.updatedAt)}
                </Field>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-white/55">
                This user has no <code className="text-white/70">users/{user.uid}/stats/summary</code> doc yet.
                Stats appear once they walk a step or complete a story in the app.
              </p>
            )}
          </section>

          <section className="rounded-md border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-white/45">
              Activity timeline
            </h2>
            <p className="mt-2 text-xs text-white/45">
              Story views and reports from the Flutter app, interleaved with
              admin actions affecting this account. Up to 50 most-recent entries.
            </p>
            {user.recentActivity.length === 0 ? (
              <p className="mt-4 text-sm text-white/45">
                No activity recorded yet. If the Flutter app is writing events
                but nothing appears here, the composite indexes in
                <code className="text-white/65"> firestore.indexes.json </code>
                may need to be deployed.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {user.recentActivity.map((e) => (
                  <li
                    key={`${e.kind}-${e.id}`}
                    className="flex items-start justify-between gap-4 border-l-2 pl-3"
                    style={{ borderLeftColor: kindColor(e.kind) }}
                  >
                    <div className="min-w-0 flex-1">
                      <ActivityRow entry={e} />
                    </div>
                    <span className="shrink-0 text-[11px] text-white/45">
                      {formatRelative(e.ts)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: actions */}
        <UserActions
          uid={user.uid}
          email={user.email}
          disabled={user.disabled}
          role={user.role}
          isSelf={isSelf}
        />
      </div>
    </div>
  );
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  if (entry.kind === "view") {
    return (
      <div>
        <p className="text-white/85">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            {entry.event ?? "viewed"}
          </span>{" "}
          <Link
            href={
              entry.storyId
                ? `/admin/stories/${entry.storyId}`
                : "#"
            }
            className="text-white hover:underline"
          >
            {entry.storyTitle ?? "(unknown story)"}
          </Link>
        </p>
        {entry.storyCity && (
          <p className="mt-0.5 text-[11px] text-white/40">{entry.storyCity}</p>
        )}
      </div>
    );
  }
  if (entry.kind === "report") {
    return (
      <div>
        <p className="text-white/85">
          <span className="text-[10px] uppercase tracking-[0.22em] text-amber-200/80">
            report · {entry.reason ?? "—"}
          </span>{" "}
          <Link
            href={entry.storyId ? `/admin/stories/${entry.storyId}` : "#"}
            className="text-white hover:underline"
          >
            {entry.storyTitle ?? "(unknown story)"}
          </Link>
        </p>
        {entry.notes && (
          <p className="mt-0.5 text-xs text-white/55">&ldquo;{entry.notes}&rdquo;</p>
        )}
        {entry.status && entry.status !== "open" && (
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-white/35">
            {entry.status}
          </p>
        )}
      </div>
    );
  }
  // audit
  return (
    <div>
      <span className="font-mono text-[11px] text-white/75">
        {entry.action ?? "(unknown)"}
      </span>
      {entry.reason && (
        <p className="mt-0.5 text-xs text-white/55">{entry.reason}</p>
      )}
      {entry.actorUid && (
        <p className="mt-0.5 truncate text-[11px] text-white/35">
          by {entry.actorUid}
        </p>
      )}
    </div>
  );
}

function kindColor(kind: ActivityEntry["kind"]): string {
  switch (kind) {
    case "view":
      return "rgba(56, 189, 248, 0.4)"; // sky
    case "report":
      return "rgba(251, 191, 36, 0.5)"; // amber
    case "audit":
      return "rgba(255, 255, 255, 0.18)";
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-[11px] uppercase tracking-[0.22em] text-white/40">
        {label}
      </dt>
      <dd className="text-white/85">{children}</dd>
    </>
  );
}

function Avatar({
  email,
  photoURL,
}: {
  email: string | null;
  photoURL: string | null;
}) {
  if (photoURL) {
    // photoURLs come from arbitrary OAuth providers (Google, Apple, …) so
    // we can't whitelist them in next.config; bypass next/image here.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt=""
        className="h-14 w-14 shrink-0 rounded-md border border-white/10 object-cover"
      />
    );
  }
  const initial = (email ?? "?").trim().charAt(0).toUpperCase();
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-display text-xl text-white/70">
      {initial}
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
