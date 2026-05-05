import { requireAdmin } from "@/lib/auth";
import { listAdminStories } from "@/lib/storyAdmin";
import { CATEGORIES } from "@/lib/categories";
import { AdminWorldMap } from "./AdminWorldMap";

export const dynamic = "force-dynamic";

export default async function AdminWorldPage() {
  await requireAdmin();
  const stories = await listAdminStories();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

  // Pinned stories only — drafts without coords have nothing to drop.
  const pinned = stories.filter(
    (s) => s.lat !== undefined && s.lon !== undefined,
  );

  return (
    <AdminWorldMap apiKey={apiKey} stories={pinned} categories={CATEGORIES} />
  );
}
