
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";

// Din Firebase-projekts konfiguration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initiera Firebase
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(firebaseApp);
const functions = getFunctions(firebaseApp, 'europe-west1'); // Exempel med region

export { firebaseApp, auth, functions };
