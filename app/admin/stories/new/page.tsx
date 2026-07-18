import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES } from "@/lib/categories";
import { NewStoryForm } from "./NewStoryForm";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  await requireAdmin();
  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.32em] text-admin-text-subtle">
          <Link href="/admin/stories" className="hover:text-admin-text-muted">
            ← Stories
          </Link>
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-admin-text">
          New story
        </h1>
        <p className="mt-1 text-sm text-admin-text-subtle">
          Creates a draft. Finish filling in the details and publish when ready.
        </p>
      </header>

      <NewStoryForm categories={CATEGORIES} />
    </div>
  );
}
