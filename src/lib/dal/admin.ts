import "server-only"; // Kritiskt! Kasta fel om denna importeras i Client Components
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initiera Admin SDK (använd Secret Manager env vars här i prod)
if (getApps().length === 0) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!))
  });
}

export const db = getFirestore();