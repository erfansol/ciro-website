declare module "firebase-admin/app" {
  export function getApps(): unknown[];
  export function initializeApp(opts: { credential: unknown }): unknown;
  export function cert(opts: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  }): unknown;
}

declare module "firebase-admin/firestore" {
  export function getFirestore(app: unknown): unknown;
}
