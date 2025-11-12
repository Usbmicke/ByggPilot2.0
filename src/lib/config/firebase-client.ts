
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Diagnostik kvarstår för säkerhets skull.
if (typeof window !== 'undefined' && !firebaseConfig.projectId) {
  console.error('[Firebase-Config] KRITISKT FEL: Firebase miljövariabler är inte laddade på klienten.');
}

// Exportera en funktion för att hämta appen, garanterar att den bara körs när den behövs.
const getClientApp = (): FirebaseApp => {
  if (getApps().length) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
};

// Exportera en funktion för att hämta auth, tvingar den att vara klient-specifik.
export const getClientAuth = (): Auth => {
  return getAuth(getClientApp());
};
