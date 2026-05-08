import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { exportAllStories } from "@/lib/storyAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stories = await exportAllStories();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const body = JSON.stringify(stories, null, 2);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="ciro-stories-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
