
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Korrekt klient-konfiguration från dina instruktioner
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: "byggpilot-v2.firebaseapp.com",
  projectId: "byggpilot-v2",
  storageBucket: "byggpilot-v2.appspot.com",
  messagingSenderId: "196837910328",
  appId: "1:196837910328:web:d4fbafaf756dbc079903cd",
  measurementId: "G-V3Z2WE286M"
};

// Initiera Firebase App (Singleton Pattern)
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Skapa och exportera Auth-instansen
const auth = getAuth(firebaseApp);

// Exportera den initierade appen och auth-instansen
export { firebaseApp, auth };
