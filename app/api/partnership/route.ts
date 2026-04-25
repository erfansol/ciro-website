import { NextResponse, type NextRequest } from "next/server";
import { partnershipSchema } from "@/lib/validation";
import { rateLimit, saveSubmission } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  const limit = rateLimit(`partnership:${ip}`);
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

  const parsed = partnershipSchema.safeParse(body);
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
    return NextResponse.json({ ok: true });
  }

  await saveSubmission({
    kind: "partnership",
    payload: {
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      message: parsed.data.message || null,
    },
    receivedAt: new Date().toISOString(),
    ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
