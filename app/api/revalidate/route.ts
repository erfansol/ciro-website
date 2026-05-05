import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";

/**
 * Webhook endpoint for instant story revalidation. A Firebase Cloud
 * Function watching `stories/{id}` writes can POST here on each change
 * to invalidate the homepage, the stories listing, and (if `id` is
 * provided) the affected detail page. Without this, ISR still refreshes
 * within 60s on its own.
 *
 * Auth: shared secret in `REVALIDATE_SECRET`. Send as
 *   - `Authorization: Bearer <secret>`, or
 *   - `?secret=<secret>` query string.
 *
 * Body (optional, JSON): `{ "id": "rome-colosseum-night" }`.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Revalidate endpoint disabled. Set REVALIDATE_SECRET." },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const queryToken = req.nextUrl.searchParams.get("secret");
  const provided = headerToken ?? queryToken;

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string } = {};
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      body = (await req.json()) as { id?: string };
    }
  } catch {
    // Empty / invalid body is fine — we still revalidate the listings.
  }

  revalidatePath("/");
  revalidatePath("/stories");
  revalidateTag("stories");

  if (typeof body.id === "string" && body.id) {
    revalidatePath(`/stories/${body.id}`);
  }

  return NextResponse.json({ ok: true, revalidatedAt: Date.now() });
}
