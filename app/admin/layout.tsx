import type { Metadata } from "next";
import { Sidebar } from "@/components/admin/Sidebar";
import { getCurrentAdmin } from "@/lib/auth";
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
  const user = await getCurrentAdmin().catch(() => null);

  return (
    <div className="flex min-h-screen bg-[#06070d] text-white">
      {user ? (
        <Sidebar user={{ email: user.email, role: user.role }} />
      ) : null}
      <main className="min-h-screen flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
