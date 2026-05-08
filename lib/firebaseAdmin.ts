import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

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
  // Some hosts persist Windows-style line endings; OpenSSL is fine with \n.
  key = key.replace(/\r\n?/g, "\n");
  return key;
}

/**
 * Escape hatches for hosts whose .env panel mangles the multi-line
 * private key. Two encoded variants, in priority order:
 *   FIREBASE_PRIVATE_KEY_HEX  — only [0-9a-f], indestructible
 *   FIREBASE_PRIVATE_KEY_B64  — base64; smaller but slightly mangleable
 * If both are absent we fall back to the raw FIREBASE_PRIVATE_KEY.
 */
function readPrivateKeyFromHex(): string | null {
  const raw = process.env.FIREBASE_PRIVATE_KEY_HEX?.replace(/\s+/g, "");
  if (!raw) return null;
  if (!/^[0-9a-fA-F]+$/.test(raw) || raw.length % 2 !== 0) {
    console.error(
      `[firebaseAdmin] FIREBASE_PRIVATE_KEY_HEX has non-hex chars or odd length (${raw.length}); ignoring.`,
    );
    return null;
  }
  try {
    return Buffer.from(raw, "hex").toString("utf8").trim();
  } catch (err) {
    console.error("[firebaseAdmin] FIREBASE_PRIVATE_KEY_HEX decode failed:", err);
    return null;
  }
}

function readPrivateKeyFromB64(): string | null {
  // Strip whitespace defensively — some panels insert soft-wrap newlines
  // that Buffer's base64 decoder usually skips, but that we don't want
  // counted in our length diagnostics.
  const raw = process.env.FIREBASE_PRIVATE_KEY_B64?.replace(/\s+/g, "");
  if (!raw) return null;
  try {
    return Buffer.from(raw, "base64").toString("utf8").trim();
  } catch (err) {
    console.error("[firebaseAdmin] FIREBASE_PRIVATE_KEY_B64 decode failed:", err);
    return null;
  }
}

function readEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const hexKey = readPrivateKeyFromHex();
  const b64Key = readPrivateKeyFromB64();
  const fallbackKey = normalisePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const privateKey = hexKey ?? b64Key ?? fallbackKey;
  // One-time visibility into which source supplied the credential and how
  // long it ended up. A valid Firebase RSA-2048 PEM is 1704 chars; values
  // notably shorter were truncated/mangled by the host's env panel.
  if (!ensureAppLogged) {
    ensureAppLogged = true;
    const rawHex = process.env.FIREBASE_PRIVATE_KEY_HEX;
    const rawB64 = process.env.FIREBASE_PRIVATE_KEY_B64;
    const using = hexKey ? "HEX" : b64Key ? "B64" : fallbackKey ? "PRIVATE_KEY" : "none";
    console.log(
      `[firebaseAdmin] keys — HEX_env=${rawHex ? `${rawHex.length} chars` : "absent"} HEX_decoded=${hexKey?.length ?? 0} B64_env=${rawB64 ? `${rawB64.length} chars` : "absent"} B64_decoded=${b64Key?.length ?? 0} PRIVATE_KEY_normalised=${fallbackKey?.length ?? 0} using=${using}`,
    );
  }
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
      `[firebaseAdmin] private key missing PEM markers — ${len} chars, starts "${head}…", ends "…${tail}"`,
    );
    return null;
  }
  return { projectId, clientEmail, privateKey };
}

export function isFirebaseConfigured(): boolean {
  return readEnv() !== null;
}

let ensureAppLogged = false;
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
  // Default storage bucket follows Firebase's convention; override via
  // FIREBASE_STORAGE_BUCKET if the project uses a non-default name.
  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    `${env.projectId}.firebasestorage.app`;
  cachedApp =
    existing ??
    initializeApp({
      credential: cert({
        projectId: env.projectId,
        clientEmail: env.clientEmail,
        privateKey: env.privateKey,
      }),
      // Casting because the firebase-admin AppOptions type omits this in
      // some package versions even though the runtime accepts it.
      ...({ storageBucket: bucketName } as Record<string, string>),
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedStorage: any = null;

export function getAdminStorage() {
  if (cachedStorage) return cachedStorage;
  cachedStorage = getStorage(ensureApp());
  return cachedStorage;
}

export function getAdminBucket() {
  return getAdminStorage().bucket();
}
