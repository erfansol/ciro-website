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
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
            <Link href="/admin/stories" className="hover:text-white/70">
              ← Stories
            </Link>
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-white">
            {story.title}
          </h1>
          <p className="mt-1 truncate text-xs text-white/40">{story.id}</p>
        </div>
        <Link
          href={`/stories/${story.id}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-md border border-white/15 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          Open public page ↗
        </Link>
      </header>

      <StoryEditorForm story={story} categories={CATEGORIES} />
    </div>
  );
}
