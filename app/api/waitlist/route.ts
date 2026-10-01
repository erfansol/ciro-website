import { NextResponse, type NextRequest } from "next/server";
import { waitlistSchema } from "@/lib/validation";
import { rateLimit, saveSubmission } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  const limit = rateLimit(`waitlist:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
    );
    return NextResponse.json(
      { error: "Please check the form.", fieldErrors },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Never report success on a failed write — a lost signup that looked
  // like it worked is unrecoverable, because the visitor won't try again.
  try {
    await saveSubmission({
      kind: "waitlist",
      payload: {
        email: parsed.data.email.toLowerCase(),
        referral: parsed.data.referral || null,
        source: parsed.data.source || "landing",
      },
      receivedAt: new Date().toISOString(),
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
  } catch (err) {
    console.error("[waitlist] submission failed:", err);
    return NextResponse.json(
      { error: "Could not save your details. Please try again shortly." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
