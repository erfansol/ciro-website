import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAdminStories } from "@/lib/storyAdmin";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await requireAdmin();
  const stories = await listAdminStories();

  const total = stories.length;
  const published = stories.filter((s) => s.published).length;
  const drafts = total - published;
  const cities = new Set(stories.map((s) => s.city)).size;

  const perCategory = CATEGORIES.map((c) => ({
    category: c,
    count: stories.filter((s) => s.category === c.id).length,
  }));

  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          Welcome, {session.email}
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-white">
          Overview
        </h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total stories" value={total} />
        <Stat label="Published" value={published} accent="#2CA6A4" />
        <Stat label="Drafts" value={drafts} accent="#FF7A45" />
        <Stat label="Cities covered" value={cities} />
      </section>

      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
          By category
        </h2>
        <ul className="mt-4 space-y-2">
          {perCategory.map((row) => (
            <li
              key={row.category.id}
              className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: row.category.color }}
                />
                <span className="text-sm text-white/85">{row.category.label}</span>
              </span>
              <span className="text-sm tabular-nums text-white/55">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <QuickLink
          href="/admin/world"
          title="Open the World"
          subtitle="Pin stories on the live map"
        />
        <QuickLink
          href="/admin/stories"
          title="Manage stories"
          subtitle="Edit, publish, retire"
        />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
        {label}
      </p>
      <p
        className="mt-3 font-display text-3xl tracking-tight text-white"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-md border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/15"
    >
      <p className="font-display text-lg tracking-tight text-white">{title}</p>
      <p className="mt-1 text-sm text-white/55">{subtitle}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/40 transition-colors group-hover:text-white/70">
        Open ›
      </p>
    </Link>
  );
}
