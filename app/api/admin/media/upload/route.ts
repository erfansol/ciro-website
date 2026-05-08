import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadStoryMedia } from "@/lib/mediaAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB hard cap.

export async function POST(req: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    console.error("[media/upload] formData parse failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not parse upload" },
      { status: 400 },
    );
  }

  const storyId = form.get("storyId");
  const file = form.get("file");
  if (typeof storyId !== "string" || storyId.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Missing storyId" },
      { status: 400 },
    );
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Missing file" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: `File too large (${file.size} bytes). Cap is ${MAX_BYTES} bytes.`,
      },
      { status: 413 },
    );
  }

  try {
    const result = await uploadStoryMedia({
      storyId,
      file,
      actorUid: session.uid,
    });
    return NextResponse.json({ ok: true, fullPath: result.fullPath });
  } catch (err) {
    console.error("[media/upload] upload failed:", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
