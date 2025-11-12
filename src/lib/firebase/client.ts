
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";

// ====================================================================================
// TEMPORÄR FELSÖKNING: Firebase-konfigurationen är hårdkodad för att kringgå
// eventuella problem med Next.js/Turbopack och laddning av miljövariabler.
// Detta bekräftar om `invalid_client`-felet beror på konfigurationen.
// ====================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDYh_D6sq3OGjJD1Rj2McgpRN7XlRlXrqg",
  authDomain: "byggpilot-v2.firebaseapp.com",
  projectId: "byggpilot-v2",
  storageBucket: "byggpilot-v2.firebasestorage.app",
  messagingSenderId: "196837910328",
  appId: "1:196837910328:web:64e7a16e69ad3e309903cd",
};

// Initiera Firebase
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(firebaseApp);
const functions = getFunctions(firebaseApp, 'europe-west1');

export { firebaseApp, auth, functions };
