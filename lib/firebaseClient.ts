"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Browser-side Firebase init for the admin sign-in flow. The web SDK
 * config below is public by Firebase's design — it identifies the
 * project to the auth servers but is not a secret. All authorisation
 * still happens server-side via `firebase-admin` and the `roles/{uid}`
 * doc check.
 *
 * If you don't see the four NEXT_PUBLIC_FIREBASE_* values in your env,
 * grab them from Firebase Console -> Project settings -> "Your apps"
 * -> Web app -> "Config".
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_* env vars. Configure them on Hostinger before signing in.",
    );
  }
  cachedApp = cachedApp ?? (getApps()[0] ?? initializeApp(config));
  cachedAuth = getAuth(cachedApp);
  return cachedAuth;
}
