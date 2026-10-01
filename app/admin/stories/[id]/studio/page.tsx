import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { readAdminTheme } from "@/lib/adminTheme";
import { getAdminBucket } from "@/lib/firebaseAdmin";
import { getAdminStory } from "@/lib/storyAdmin";
import { EXPERIENCE_KIND_LABELS } from "@/lib/walkSchema";
import { WalkStudio } from "./WalkStudio";

export const dynamic = "force-dynamic";

type Params = { id: string };

/**
 * Story Studio — where a story's *experience* is authored: the narrated
 * walk (stops on a map, narration, interactions), its voice, and its
 * production stage. Card copy, pricing and publishing stay on the story
 * editor page; this page only touches `walk` and `production`.
 */
export default async function StoryStudioPage({
  params,
}: {
  params: Promise<Params>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [story, theme] = await Promise.all([getAdminStory(id), readAdminTheme()]);
  if (!story) notFound();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
  const bucketName = getAdminBucket().name as string;
  const aiConfigured = Boolean(process.env.GEMINI_API_KEY);

  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-admin-text-subtle">
            <Link href="/admin/stories" className="hover:text-admin-text-muted">
              ← Stories
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/admin/stories/${story.id}`} className="hover:text-admin-text-muted">
              {story.title}
            </Link>
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-admin-text">
            Studio · {story.title}
          </h1>
          <p className="mt-1 text-xs text-admin-text-subtle">
            {EXPERIENCE_KIND_LABELS[story.kind]} · {story.id}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/admin/stories/${story.id}`}
            className="rounded-md border border-admin-border-strong bg-admin-surface px-4 py-2 text-xs uppercase tracking-[0.22em] text-admin-text-muted transition-colors hover:text-admin-text"
          >
            Card, price &amp; publish
          </Link>
          <Link
            href={`/admin/stories/${story.id}/media`}
            className="rounded-md border border-admin-border-strong bg-admin-surface px-4 py-2 text-xs uppercase tracking-[0.22em] text-admin-text-muted transition-colors hover:text-admin-text"
          >
            Media
          </Link>
        </div>
      </header>

      <WalkStudio
        story={story}
        apiKey={apiKey}
        theme={theme}
        bucketName={bucketName}
        aiConfigured={aiConfigured}
      />
    </div>
  );
}
