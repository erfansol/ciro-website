import { readFile } from "node:fs/promises";
import path from "node:path";
import { FILMS } from "@/lib/films";

/**
 * Serves the Ciro film assets (drawing, soundtrack, poster) through Node.
 *
 * They deliberately live outside /public: Hostinger's edge answers any
 * static-looking path (".html", ".mp3", ".webp") from its own copy of the
 * public folder and never falls through to Next, so newly added public
 * files 404 in production. Extension-free URLs always reach this handler.
 */
const KINDS = {
  html: { ext: "html", type: "text/html; charset=utf-8" },
  audio: { ext: "mp3", type: "audio/mpeg" },
  poster: { ext: "webp", type: "image/webp" },
} as const;

const IDS = new Set(FILMS.map((f) => f.id));

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; kind: string }> },
) {
  const { id, kind } = await params;
  const k = KINDS[kind as keyof typeof KINDS];
  if (!k || !IDS.has(id)) return new Response("Not found", { status: 404 });
  try {
    const file = await readFile(path.join(process.cwd(), "film-assets", `${id}.${k.ext}`));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": k.type,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
