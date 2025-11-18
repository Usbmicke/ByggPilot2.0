
// ====================================================================
// KLIENT-SIDA FIREBASE KONFIGURATION (FÖR WEBLÄSAREN)
// ====================================================================
// Denna fil initierar Firebase på klientsidan. Den använder publika
// miljövariabler (prefixade med NEXT_PUBLIC_) för att säkert ladda
// konfigurationen utan att exponera hemligheter.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Din webbapps Firebase-konfiguration. 
// FÖR ATT DETTA SKA FUNGERA:
// 1. Skapa en .env.local-fil i projektets rot.
// 2. Lägg till dina Firebase webb-nycklar där.
//    Exempel:
//    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy...YOUR_KEY"
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
//    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
//    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
//    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
//    NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initiera Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // Använd den befintliga appen om den redan har initierats
}

export const auth = getAuth(app);
