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
function readEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
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
