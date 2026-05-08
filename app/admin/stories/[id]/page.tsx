import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminStory } from "@/lib/storyAdmin";
import { CATEGORIES } from "@/lib/categories";
import { StoryEditorForm } from "./StoryEditorForm";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function StoryEditPage({
  params,
}: {
  params: Promise<Params>;
}) {
  await requireAdmin();
  const { id } = await params;
  const story = await getAdminStory(id);
  if (!story) notFound();

  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-8 flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-admin-text-subtle">
            <Link href="/admin/stories" className="hover:text-admin-text-muted">
              ← Stories
            </Link>
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-admin-text">
            {story.title}
          </h1>
          <p className="mt-1 truncate text-xs text-admin-text-subtle">{story.id}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/admin/stories/${story.id}/media`}
            className="rounded-md border border-admin-border-strong bg-admin-surface px-4 py-2 text-xs uppercase tracking-[0.22em] text-admin-text-muted transition-colors hover:border-admin-border-strong hover:text-admin-text"
          >
            Manage media
          </Link>
          <Link
            href={`/stories/${story.id}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-admin-border-strong bg-admin-surface px-4 py-2 text-xs uppercase tracking-[0.22em] text-admin-text-muted transition-colors hover:border-admin-border-strong hover:text-admin-text"
          >
            Open public page ↗
          </Link>
        </div>
      </header>

      <StoryEditorForm story={story} categories={CATEGORIES} />
    </div>
  );
}
