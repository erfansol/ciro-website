import { NextResponse, type NextRequest } from "next/server";
import { notifySchema } from "@/lib/validation";
import { rateLimit, saveSubmission } from "@/lib/storage";
import { getCityBySlug } from "@/lib/cities";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  const limit = rateLimit(`notify:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${limit.retryAfter}s.` },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = notifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form." }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true });
  if (!getCityBySlug(parsed.data.citySlug)) {
    return NextResponse.json({ error: "Unknown city." }, { status: 400 });
  }

  await saveSubmission({
    kind: "notify",
    payload: {
      email: parsed.data.email.toLowerCase(),
      citySlug: parsed.data.citySlug,
    },
    receivedAt: new Date().toISOString(),
    ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
