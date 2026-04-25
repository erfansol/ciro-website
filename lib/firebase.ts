import type { Submission } from "./storage";

type FirestoreClient = {
  collection: (name: string) => { add: (data: Record<string, unknown>) => Promise<unknown> };
};

let cached: FirestoreClient | null = null;

async function getFirestore(): Promise<FirestoreClient> {
  if (cached) return cached;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase backend selected but FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are missing.",
    );
  }

  const adminMod = await import(/* webpackIgnore: true */ "firebase-admin/app").catch(
    () => null,
  );
  const firestoreMod = await import(/* webpackIgnore: true */ "firebase-admin/firestore").catch(
    () => null,
  );

  if (!adminMod || !firestoreMod) {
    throw new Error(
      "firebase-admin is not installed. Run `npm install firebase-admin` to enable the firebase backend.",
    );
  }

  const apps = adminMod.getApps();
  const app =
    apps.length > 0
      ? apps[0]
      : adminMod.initializeApp({
          credential: adminMod.cert({ projectId, clientEmail, privateKey }),
        });

  cached = firestoreMod.getFirestore(app) as FirestoreClient;
  return cached;
}

export async function saveSubmission(entry: Submission) {
  const db = await getFirestore();
  await db.collection(`ciro_${entry.kind}`).add({
    ...entry.payload,
    receivedAt: entry.receivedAt,
    ip: entry.ip ?? null,
    userAgent: entry.userAgent ?? null,
  });
}
