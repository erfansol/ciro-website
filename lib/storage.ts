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
const backend = (): Backend =>
  (process.env.EMAIL_BACKEND === "firebase" ? "firebase" : "mock");

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "submissions.json");

async function appendMock(entry: Submission) {
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

export async function saveSubmission(entry: Submission) {
  if (backend() === "firebase") return appendFirebase(entry);
  return appendMock(entry);
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const buckets = new Map<string, number[]>();

export function rateLimit(key: string) {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (arr.length >= RATE_LIMIT_MAX) {
    buckets.set(key, arr);
    return { ok: false, retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - arr[0])) / 1000) };
  }
  arr.push(now);
  buckets.set(key, arr);
  return { ok: true, retryAfter: 0 };
}
