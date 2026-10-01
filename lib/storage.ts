import { promises as fs } from "node:fs";
import path from "node:path";

export type SubmissionKind = "waitlist" | "partnership" | "notify";

export type Submission = {
  kind: SubmissionKind;
  payload: Record<string, unknown>;
  receivedAt: string;
  ip?: string;
  userAgent?: string;
};

type Backend = "mock" | "firebase";

const isProduction = () => process.env.NODE_ENV === "production";

/**
 * Which persistence backend handles form submissions.
 *
 * `mock` writes to a local JSON file, which only makes sense on a developer
 * machine — on a hosted deployment the filesystem is ephemeral and may not
 * even be writable, so a "successful" submission would be silently thrown
 * away. Defaulting to `mock` in production once cost real signups: the form
 * returned `{ ok: true }` and the lead went nowhere.
 *
 * So in production the default flips to `firebase`, and a misconfiguration
 * fails loudly at the call site rather than quietly dropping data.
 */
const backend = (): Backend => {
  const configured = process.env.EMAIL_BACKEND?.trim().toLowerCase();
  if (configured === "firebase") return "firebase";
  if (configured === "mock") return "mock";
  return isProduction() ? "firebase" : "mock";
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "submissions.json");

async function appendMock(entry: Submission) {
  if (isProduction()) {
    // Reached only if someone explicitly set EMAIL_BACKEND=mock in prod.
    console.warn(
      "[storage] EMAIL_BACKEND=mock in production — submissions are being " +
        "written to an ephemeral filesystem and will be lost on redeploy.",
    );
  }
  await fs.mkdir(dataDir, { recursive: true });
  let existing: Submission[] = [];
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    existing = JSON.parse(raw) as Submission[];
  } catch {
    existing = [];
  }
  existing.push(entry);
  await fs.writeFile(dataFile, JSON.stringify(existing, null, 2), "utf8");
}

async function appendFirebase(entry: Submission) {
  const { saveSubmission } = await import("./firebase");
  await saveSubmission(entry);
}

/**
 * Persist a public form submission.
 *
 * Throws if the selected backend is unavailable. Callers must let that
 * propagate to a 5xx — telling someone they're on the waitlist when the
 * write failed is worse than showing them an error they can retry.
 */
export async function saveSubmission(entry: Submission) {
  if (backend() === "firebase") {
    const { isFirebaseConfigured } = await import("./firebaseAdmin");
    if (!isFirebaseConfigured()) {
      throw new Error(
        "EMAIL_BACKEND=firebase but Firebase Admin credentials are missing " +
          "(FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY). " +
          "Refusing to accept the submission rather than discard it.",
      );
    }
    return appendFirebase(entry);
  }
  return appendMock(entry);
}

// ── Rate limiting ─────────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

/**
 * Cap on distinct keys held at once.
 *
 * The bucket map is keyed by client IP. Without a cap it grows without
 * bound for the lifetime of the process — every unique IP that ever hits a
 * form leaves an entry behind, since nothing removes keys whose timestamps
 * have all aged out. A crawler sweep or a spoofed `x-forwarded-for` header
 * turns that into steady memory growth until the process is recycled.
 *
 * 10k keys is far above real traffic for this site and bounds the map at a
 * few hundred KB.
 */
const RATE_LIMIT_MAX_KEYS = 10_000;

const buckets = new Map<string, number[]>();

/**
 * Bring the map back under [RATE_LIMIT_MAX_KEYS], in increasing order of
 * how much the entry is worth keeping. `protect` is the key we just served
 * and is never dropped.
 *
 * The ordering is the security-relevant part. Entries are evicted:
 *   1. expired — no enforcement value at all;
 *   2. under quota — dropping these costs an attacker nothing they didn't
 *      already have, since they still had budget left;
 *   3. at quota — last resort only.
 *
 * A plain least-recently-used sweep would invert this. The key that is
 * *blocked* is by definition the one that stopped calling, making it the
 * least-recently-used entry and the first to be evicted — so a caller
 * could clear their own block just by flooding the map with throwaway
 * keys (trivial via a spoofed `x-forwarded-for`). Evicting the harmless
 * entries first keeps a block in place for its full window under exactly
 * the burst that would otherwise erase it.
 */
function evictDown(now: number, protect: string) {
  for (const [key, times] of buckets) {
    if (buckets.size <= RATE_LIMIT_MAX_KEYS) return;
    if (key === protect) continue;
    if (times.length === 0 || now - times[times.length - 1] >= RATE_LIMIT_WINDOW_MS) {
      buckets.delete(key);
    }
  }
  for (const [key, times] of buckets) {
    if (buckets.size <= RATE_LIMIT_MAX_KEYS) return;
    if (key === protect) continue;
    if (times.length < RATE_LIMIT_MAX) buckets.delete(key);
  }
  for (const key of buckets.keys()) {
    if (buckets.size <= RATE_LIMIT_MAX_KEYS) return;
    if (key === protect) continue;
    buckets.delete(key);
  }
}

/**
 * Per-key fixed-window rate limit.
 *
 * Note this is per-process, in-memory state. Behind multiple instances each
 * one keeps its own counters, so the effective limit is
 * `RATE_LIMIT_MAX × instances`. That is acceptable for spam-damping on
 * public forms — the honeypot and zod validation are the real filters — but
 * it is not a security control. Anything needing a hard global limit has to
 * move to shared storage.
 */
export function rateLimit(key: string) {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  // Re-insert rather than overwrite so Map iteration order tracks recency:
  // a plain `set` on an existing key leaves its original position, which
  // would make the eviction below least-recently-*inserted* instead of
  // least-recently-*used*. That distinction matters — the abusive key is
  // the oldest-inserted one, so insertion-order eviction would drop its
  // bucket and hand it a fresh allowance, which is the opposite of the
  // intent. A caller can then clear their own limit just by flooding the
  // map with throwaway keys (trivial via a spoofed x-forwarded-for).
  buckets.delete(key);

  if (arr.length >= RATE_LIMIT_MAX) {
    buckets.set(key, arr);
    return {
      ok: false,
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - arr[0])) / 1000),
    };
  }

  arr.push(now);
  buckets.set(key, arr);

  // Sweep lazily on write, and only once the map is actually large, so the
  // common path stays O(1) rather than O(keys) on every request.
  if (buckets.size > RATE_LIMIT_MAX_KEYS) evictDown(now, key);

  return { ok: true, retryAfter: 0 };
}

/** Test seam: clears all rate-limit state. */
export function __resetRateLimit() {
  buckets.clear();
}
