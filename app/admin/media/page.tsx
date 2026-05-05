import { requireAdmin } from "@/lib/auth";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireAdmin();
  return (
    <ComingSoon
      eyebrow="Assets"
      title="Media library"
      description="Phase 3 will add a drag-to-upload media manager backed by Firebase Storage at gs://<project>/stories/{id}/. Each asset gets a reverse index of the stories it appears in so deletes are blocked when in use."
    />
  );
}
