/**
 * One-shot bootstrap that grants the seed admin role to a Firebase uid.
 *
 *   tsx scripts/seed-admin.ts <uid> [role]
 *
 * Examples:
 *   tsx scripts/seed-admin.ts Sj84H8NmrUZ7KNkdEr0exv2NRvg2
 *   tsx scripts/seed-admin.ts Sj84H8NmrUZ7KNkdEr0exv2NRvg2 admin
 *   tsx scripts/seed-admin.ts <other-uid> moderator
 *
 * Reads FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 * from `.env.production` (or the host environment) and writes a single
 * doc at `roles/{uid}` with the chosen role. Idempotent — running it
 * twice for the same uid just refreshes the timestamps.
 *
 * Run from the `website/` directory so dotenv finds the env file:
 *   npx tsx scripts/seed-admin.ts Sj84H8NmrUZ7KNkdEr0exv2NRvg2
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type Role = "admin" | "moderator" | "editor";
const VALID: ReadonlySet<Role> = new Set(["admin", "moderator", "editor"]);

function loadEnvFile(path: string) {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  const [, , uidArg, roleArg = "admin"] = process.argv;
  if (!uidArg) {
    console.error(
      "Usage: tsx scripts/seed-admin.ts <uid> [admin|moderator|editor]",
    );
    process.exit(1);
  }
  if (!VALID.has(roleArg as Role)) {
    console.error(`Invalid role "${roleArg}". Must be one of: admin, moderator, editor.`);
    process.exit(1);
  }

  // Pick up env from .env.production (or the user's current shell).
  loadEnvFile(resolve(process.cwd(), ".env.production"));
  loadEnvFile(resolve(process.cwd(), ".env"));

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY. " +
        "Either fill in .env.production or export them in this shell.",
    );
    process.exit(1);
  }

  const app =
    getApps()[0] ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  // The firebase-admin/firestore .d.ts re-exports the Firestore type from a
  // namespaced @google-cloud/firestore declaration that doesn't resolve under
  // moduleResolution: "bundler" — same workaround as lib/firebaseAdmin.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = getFirestore(app);

  const ref = db.collection("roles").doc(uidArg);
  const existing = await ref.get();
  const now = new Date().toISOString();

  await ref.set(
    {
      role: roleArg,
      grantedBy: existing.exists ? (existing.data()?.grantedBy ?? "seed") : "seed",
      grantedAt: existing.exists ? (existing.data()?.grantedAt ?? now) : now,
      updatedAt: now,
    },
    { merge: true },
  );

  console.log(
    `${existing.exists ? "Updated" : "Created"} roles/${uidArg} -> { role: "${roleArg}" }`,
  );
}

main().catch((err) => {
  console.error("seed-admin failed:", err);
  process.exit(1);
});
