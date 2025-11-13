
// Denna fil är byggd enligt "Guldstandard"-blueprinten (Del 3.1 & 3.2)
// för en robust och korrekt Firebase-klient i en Next.js-miljö.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // GULDSTANDARD-FIX 5.0: Tar bort manuell överskrivning. Värdet hämtas nu
  // från .env.local, som är den enda källan till sanning.
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton-mönster: Säkerställer att endast en Firebase-instans skapas.
function createFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export const app: FirebaseApp = createFirebaseApp();
export const auth: Auth = getAuth(app);
