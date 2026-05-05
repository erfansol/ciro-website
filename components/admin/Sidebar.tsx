"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Item = {
  href: string;
  label: string;
  // SVG path data so the sidebar stays self-contained without an icon dep.
  d: string;
};

const PRIMARY: Item[] = [
  {
    href: "/admin",
    label: "Overview",
    d: "M3 12L12 3l9 9M5 10v10h14V10",
  },
  {
    href: "/admin/world",
    label: "World",
    d: "M12 21a9 9 0 100-18 9 9 0 000 18zm0 0V3M3 12h18",
  },
  {
    href: "/admin/stories",
    label: "Stories",
    d: "M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4zm0 0v16",
  },
  {
    href: "/admin/moderation",
    label: "Moderation",
    d: "M12 3l8 4v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7l8-4z",
  },
  {
    href: "/admin/media",
    label: "Media",
    d: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6",
  },
  {
    href: "/admin/users",
    label: "Users",
    d: "M16 14a4 4 0 10-8 0M3 21v-1a5 5 0 015-5h8a5 5 0 015 5v1",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    d: "M4 20V8m6 12V4m6 16v-8m6 8v-4",
  },
];

export function Sidebar({
  user,
}: {
  user: { email: string | null; role: string };
}) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0d16]">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-[#FFD54F]" />
        </span>
        <span className="font-display text-[14px] font-medium tracking-[0.22em] text-white/85">
          CIRO
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          admin
        </span>
      </div>

      <nav className="flex-1 px-3 pb-4">
        <ul className="space-y-0.5">
          {PRIMARY.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-white/[0.06] text-white"
                      : "text-white/55 hover:bg-white/[0.03] hover:text-white/85",
                  )}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d={item.d} />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/[0.06] px-5 py-4">
        <p className="truncate text-[12px] text-white/70" title={user.email ?? ""}>
          {user.email ?? "(unknown)"}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            {user.role}
          </span>
          <form action="/admin/signout" method="post">
            <button
              type="submit"
              className="text-[11px] uppercase tracking-[0.22em] text-white/45 transition-colors hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
