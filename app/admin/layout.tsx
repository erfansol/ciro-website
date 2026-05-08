import type { Metadata } from "next";
import { Sidebar } from "@/components/admin/Sidebar";
import { getCurrentAdmin } from "@/lib/auth";
import { readAdminTheme } from "@/lib/adminTheme";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Ciro Admin",
  description: "Internal admin dashboard for the Ciro storytelling platform.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout never redirects (would loop with /admin/login). It just
  // decides whether to show the sidebar; protected pages call
  // requireAdmin() themselves.
  const [user, theme] = await Promise.all([
    getCurrentAdmin().catch(() => null),
    readAdminTheme(),
  ]);

  // The whole admin tree shares one [data-admin-theme] root so the CSS
  // variables in globals.css can switch all token-based pages in one
  // attribute flip. Pages still using bare colours stay dark-styled.
  return (
    <div
      data-admin-theme={theme}
      className="flex min-h-screen bg-admin-bg text-admin-text"
    >
      {user ? (
        <Sidebar
          user={{ email: user.email, role: user.role }}
          theme={theme}
        />
      ) : null}
      <main className="min-h-screen flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
