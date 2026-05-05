import { requireAdmin } from "@/lib/auth";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  await requireAdmin();
  return (
    <ComingSoon
      eyebrow="Trust & safety"
      title="Moderation queue"
      description="Phase 2 will surface user-submitted reports, AI-flagged stories, and pending submissions in a single triage view with one-click approve / reject actions and reason tagging. Backed by the new reports/ Firestore collection and writing every decision to auditLog/."
    />
  );
}
