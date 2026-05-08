import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminStory } from "@/lib/storyAdmin";
import {
  formatBytes,
  isImageContentType,
  listStoryMedia,
} from "@/lib/mediaAdmin";
import { MediaUploader } from "@/components/admin/MediaUploader";
import {
  CopyUrlButton,
  MediaDeleteButton,
  PreviewToggleButton,
} from "@/components/admin/MediaItem";

export const dynamic = "force-dynamic";

export default async function StoryMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [story, files] = await Promise.all([
    getAdminStory(id),
    listStoryMedia(id),
  ]);
  if (!story) notFound();

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="px-8 py-8 lg:px-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/admin/stories/${id}`}
            className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle hover:text-admin-text"
          >
            ← Back to story
          </Link>
          <h1 className="mt-2 font-display text-2xl tracking-tight text-admin-text">
            {story.title}
          </h1>
          <p className="mt-1 text-xs text-admin-text-subtle">
            stories/{id}/ · {files.length} files · {formatBytes(totalBytes)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <MediaUploader storyId={id} />
      </div>

      {files.length === 0 ? (
        <p className="rounded-md border border-admin-border bg-admin-surface p-8 text-sm text-admin-text-muted">
          No files yet. Drag files into the area above, or click &ldquo;Choose
          files&rdquo;.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => (
            <li
              key={f.fullPath}
              className="overflow-hidden rounded-md border border-admin-border bg-admin-surface"
            >
              <div className="flex aspect-video items-center justify-center bg-black/40">
                {isImageContentType(f.contentType) ? (
                  // Signed read URL valid 24h; kept off next/image to avoid
                  // having to whitelist the storage host in next.config.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.signedReadUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-admin-text-muted">
                    <span className="font-mono text-xs uppercase tracking-[0.22em]">
                      {extLabel(f.name, f.contentType)}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <p className="truncate font-mono text-[12px] text-admin-text" title={f.name}>
                  {f.name}
                </p>
                <p className="text-[11px] text-admin-text-subtle">
                  {formatBytes(f.size)} · {f.contentType}
                </p>
                <p className="text-[11px] text-admin-text-faint">
                  {formatRelative(f.updatedAt)}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <PreviewToggleButton
                    storyId={id}
                    filename={f.name}
                    isPreview={f.isPreview}
                  />
                  <a
                    href={f.signedReadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-admin-border bg-admin-surface px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-admin-text-muted transition-colors hover:border-admin-border-strong hover:text-admin-text"
                  >
                    Open
                  </a>
                  <CopyUrlButton url={f.signedReadUrl} />
                  <MediaDeleteButton storyId={id} filename={f.name} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-[11px] text-admin-text-faint">
        Preview URLs are signed for 24h. They expire — copy the URL only for
        ad-hoc sharing, not for hard-coding into Flutter or stories docs.
      </p>
    </div>
  );
}

function extLabel(name: string, contentType: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1) : "";
  if (ext) return ext;
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.includes("zip")) return "zip";
  return "file";
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 30 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toISOString().slice(0, 10);
}
