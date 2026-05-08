import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { StoryImporter } from "@/components/admin/StoryImporter";

export const dynamic = "force-dynamic";

export default async function StoryImportPage() {
  await requireAdmin();
  return (
    <div className="px-8 py-8 lg:px-12">
      <div className="mb-6">
        <Link
          href="/admin/stories"
          className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle hover:text-admin-text"
        >
          ← Stories
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-admin-text">
          Bulk import
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-admin-text-muted">
          Round-trip the canonical seed file: <strong>Export JSON</strong> from
          the stories list, edit in your tool of choice, paste back here, hit
          Preview to see exactly what will change, then Apply. Every
          create/update lands in <code className="text-admin-text">auditLog/</code>{" "}
          with <code className="text-admin-text">reason: &quot;bulk import&quot;</code>.
        </p>
      </div>
      <StoryImporter />
    </div>
  );
}
