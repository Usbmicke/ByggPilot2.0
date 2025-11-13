
// Denna fil är byggd enligt "Guldstandard"-blueprinten (Del 3.1 & 3.2)
// för en robust och korrekt Firebase-klient i en Next.js-miljö.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// FIX: Korrekt authDomain för Cloud Workstations-miljön.
// Detta är den viktigaste ändringen för att lösa inloggningsproblemet.
const authDomain = "3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton-mönster: Säkerställer att endast en Firebase-instans skapas.
function createFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    console.log(`[Firebase Client] Initialiserar Firebase App för authDomain: '${authDomain}'`);
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export const app: FirebaseApp = createFirebaseApp();
export const auth: Auth = getAuth(app);
