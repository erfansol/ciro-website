import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { uploadStoryBundle, type BundlePlatform } from "@/lib/bundleAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Unity bundles with a character and textures run 5–60 MB; the Sacred Bow
// plan targets 60 MB for a whole bundle, so cap a little above that.
const MAX_BYTES = 120 * 1024 * 1024;

export async function POST(req: Request) {
  let session;
  try {
    session = await requireRole(["admin", "editor"]);
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    console.error("[bundles/upload] formData parse failed:", err);
    return NextResponse.json({ ok: false, error: "Could not parse upload" }, { status: 400 });
  }

  const storyId = form.get("storyId");
  const platform = form.get("platform");
  const file = form.get("file");
  if (typeof storyId !== "string" || storyId.length === 0) {
    return NextResponse.json({ ok: false, error: "Missing storyId" }, { status: 400 });
  }
  if (platform !== "ios" && platform !== "android") {
    return NextResponse.json({ ok: false, error: "platform must be ios or android" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `Bundle too large (${file.size} bytes). Cap is ${MAX_BYTES} bytes.` },
      { status: 413 },
    );
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await uploadStoryBundle({
      storyId,
      platform: platform as BundlePlatform,
      bytes,
      actorUid: session.uid,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[bundles/upload] failed:", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
