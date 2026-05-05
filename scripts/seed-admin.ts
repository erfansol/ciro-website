/**
 * One-shot bootstrap that grants an admin role to a Firebase uid.
 *
 *   npx tsx scripts/seed-admin.ts <uid> [role]
 *
 * Examples:
 *   npx tsx scripts/seed-admin.ts Sj84H8NmrUZ7KNkdEr0exv2NRvg2
 *   npx tsx scripts/seed-admin.ts Sj84H8NmrUZ7KNkdEr0exv2NRvg2 admin
 *   npx tsx scripts/seed-admin.ts <other-uid> moderator
 *
 * Reads FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 * from `.env.production` (or the host environment) and writes a single
 * doc at `roles/{uid}` with the chosen role. Idempotent — running it
 * twice for the same uid just refreshes the timestamps.
 *
 * Run from the `website/` directory:
 *   cd website
 *   npx tsx scripts/seed-admin.ts Sj84H8NmrUZ7KNkdEr0exv2NRvg2
 */

import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type Role = "admin" | "moderator" | "editor";
const VALID: ReadonlySet<Role> = new Set(["admin", "moderator", "editor"]);

function normalisePrivateKey(raw: string | undefined): string | null {
  if (!raw) return null;
  let key = raw.trim();
  // Strip wrapping quotes if the user pasted them.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  // Convert literal "\n" sequences (the JSON-encoded form copy-pasted from
  // the Firebase service-account JSON) into real newlines. dotenv leaves
  // them as `\n` when they appear inside a quoted single-line value.
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key;
}

function describeKeyForError(key: string): string {
  // Avoid printing the body of the private key (it's a credential), but
  // give enough info to debug malformed values.
  const lines = key.split("\n").length;
  const head = key.slice(0, 40).replace(/\s+/g, " ");
  const tail = key.slice(-40).replace(/\s+/g, " ");
  return `${key.length} chars, ${lines} line(s) — starts "${head}…", ends "…${tail}"`;
}

async function main() {
  const [, , uidArg, roleArg = "admin"] = process.argv;
  if (!uidArg) {
    console.error(
      "Usage: npx tsx scripts/seed-admin.ts <uid> [admin|moderator|editor]",
    );
    process.exit(1);
  }
  if (!VALID.has(roleArg as Role)) {
    console.error(
      `Invalid role "${roleArg}". Must be one of: admin, moderator, editor.`,
    );
    process.exit(1);
  }

  // dotenv handles multi-line quoted values, comments, blank lines, and
  // both single-line `\n`-escaped values and physically multi-line keys.
  loadDotenv({ path: resolve(process.cwd(), ".env.production") });
  loadDotenv({ path: resolve(process.cwd(), ".env"), override: false });

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalisePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY. " +
        "Fill them in .env.production or export them in this shell.",
    );
    process.exit(1);
  }

  if (
    !privateKey.includes("BEGIN PRIVATE KEY") ||
    !privateKey.includes("END PRIVATE KEY")
  ) {
    console.error(
      "FIREBASE_PRIVATE_KEY does not look like a PEM block.",
      `\nDetected: ${describeKeyForError(privateKey)}`,
      "\nPaste the full value of `private_key` from your Firebase service-account JSON,",
      "\nincluding the BEGIN/END markers. Either form is fine:",
      '\n  • single line with \\n escapes:  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIE…\\n-----END PRIVATE KEY-----\\n"',
      '\n  • multi-line value in quotes:    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n                                              MIIE…\n                                              -----END PRIVATE KEY-----\n                                              "',
    );
    process.exit(1);
  }

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  // The firebase-admin/firestore .d.ts re-exports types from a namespaced
  // @google-cloud/firestore declaration that doesn't resolve under
  // moduleResolution: "bundler" — same workaround as lib/firebaseAdmin.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = getFirestore(app);

  const ref = db.collection("roles").doc(uidArg);
  const existing = await ref.get();
  const now = new Date().toISOString();

  await ref.set(
    {
      role: roleArg,
      grantedBy: existing.exists
        ? (existing.data()?.grantedBy ?? "seed")
        : "seed",
      grantedAt: existing.exists
        ? (existing.data()?.grantedAt ?? now)
        : now,
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
