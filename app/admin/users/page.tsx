import { requireAdmin } from "@/lib/auth";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdmin();
  return (
    <ComingSoon
      eyebrow="Accounts"
      title="Users"
      description="Phase 2 will list Firebase Auth users with their activity timeline (story views, completions, reports), and let admins suspend / ban / restore. Roles are managed under roles/{uid}; the seed admin is set during deployment."
    />
  );
}
