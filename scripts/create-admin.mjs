import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const ENV_PATH = "/Users/erfan/Documents/cirocodex/website/.env.production";

function parseEnv(text) {
  const env = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = parseEnv(readFileSync(ENV_PATH, "utf8"));

const projectId = env.FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing FIREBASE_* env vars in .env.production");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const auth = getAuth();
const db = getFirestore();

const email = process.argv[2] || "mrerfansol@gmail.com";
const password = randomBytes(15).toString("base64url");

let user;
try {
  user = await auth.getUserByEmail(email);
  console.log(`Existing user found: ${user.uid} — updating password.`);
  user = await auth.updateUser(user.uid, { password, emailVerified: true });
} catch (e) {
  if (e.code === "auth/user-not-found") {
    console.log("No existing user — creating fresh.");
    user = await auth.createUser({ email, password, emailVerified: true });
    console.log(`Created uid: ${user.uid}`);
  } else {
    throw e;
  }
}

const now = new Date().toISOString();
const ref = db.collection("roles").doc(user.uid);
const existing = await ref.get();
await ref.set(
  {
    role: "admin",
    grantedBy: existing.exists
      ? (existing.data()?.grantedBy ?? "create-admin")
      : "create-admin",
    grantedAt: existing.exists
      ? (existing.data()?.grantedAt ?? now)
      : now,
    updatedAt: now,
  },
  { merge: true },
);

console.log("\n=========================================");
console.log("  CIRO admin credentials");
console.log("=========================================");
console.log(`  email:    ${email}`);
console.log(`  password: ${password}`);
console.log(`  uid:      ${user.uid}`);
console.log(`  role:     admin (roles/${user.uid})`);
console.log("=========================================");
console.log("\nSign in at: https://ciroai.com/admin/login");
