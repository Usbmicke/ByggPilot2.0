
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp } from 'firebase/app';

// Korrekt klient-konfiguration från dina instruktioner
export const firebaseConfig = {
  apiKey: "AIzaSyCZSTGIjL3r5AA3RfqCBCAgGdM8pu-hGNg",
  authDomain: "byggpilot-v2.firebaseapp.com",
  projectId: "byggpilot-v2",
  storageBucket: "byggpilot-v2.appspot.com",
  messagingSenderId: "196837910328",
  appId: "1:196837910328:web:d4fbafaf756dbc079903cd",
  measurementId: "G-V3Z2WE286M"
};

// Initiera Firebase App (Singleton Pattern)
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportera den initierade appen
export { firebaseApp };
