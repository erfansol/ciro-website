import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * Singleton Firebase Admin app for server use. Both `lib/firebase.ts`
 * (Firestore reads/writes for the public site) and `lib/auth.ts` (admin
 * dashboard session cookies) share this initialised app so we only ever
 * call `initializeApp` once per process.
 *
 * Returns `null` when env vars are missing — callers must guard so
 * preview / local dev without Firebase still renders.
 */
function normalisePrivateKey(raw: string | undefined): string | null {
  if (!raw) return null;
  let key = raw.trim();
  // Hostinger's .env importer (and others) sometimes preserve the wrapping
  // quotes as literal characters in the value. Strip them.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  // Service-account JSONs ship the key as a single line with literal "\n"
  // escapes. Convert those into real newlines for OpenSSL/PEM parsing.
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key;
}

function readEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalisePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  if (!projectId || !clientEmail || !privateKey) return null;
  if (
    !privateKey.includes("BEGIN PRIVATE KEY") ||
    !privateKey.includes("END PRIVATE KEY")
  ) {
    // Surface a concrete diagnostic in the server log without leaking the
    // key body. Without this, firebase-admin throws "Invalid PEM formatted
    // message" with no clue about which env var is broken.
    const len = privateKey.length;
    const head = privateKey.slice(0, 32).replace(/\s+/g, " ");
    const tail = privateKey.slice(-32).replace(/\s+/g, " ");
    console.error(
      `[firebaseAdmin] FIREBASE_PRIVATE_KEY missing PEM markers — ${len} chars, starts "${head}…", ends "…${tail}"`,
    );
    return null;
  }
  return { projectId, clientEmail, privateKey };
}

export function isFirebaseConfigured(): boolean {
  return readEnv() !== null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedApp: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedDb: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedAuth: any = null;

function ensureApp() {
  if (cachedApp) return cachedApp;
  const env = readEnv();
  if (!env) {
    throw new Error(
      "Firebase backend selected but FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are missing.",
    );
  }
  const existing = getApps()[0];
  cachedApp =
    existing ??
    initializeApp({
      credential: cert({
        projectId: env.projectId,
        clientEmail: env.clientEmail,
        privateKey: env.privateKey,
      }),
    });
  return cachedApp;
}

export function getAdminDb() {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(ensureApp());
  return cachedDb;
}

export function getAdminAuth() {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(ensureApp());
  return cachedAuth;
}
