// src/lib/config/firebase-admin.ts
import admin from 'firebase-admin';
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// --- ROBUST SINGLETON-IMPLEMENTATION ---

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

// Denna kontroll körs bara en gång när modulen laddas.
if (!serviceAccountJson) {
  console.error('[Admin SDK] KRITISKT FEL: Miljövariabeln FIREBASE_SERVICE_ACCOUNT_JSON är inte satt.');
  throw new Error('Miljövariabeln FIREBASE_SERVICE_ACCOUNT_JSON är inte satt. Appen kan inte starta på servern.');
}

let app;

if (getApps().length === 0) {
  // Om ingen app finns, skapa en ny.
  console.log('[Admin SDK]: Skapar en ny Firebase Admin-instans...');
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    app = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('[Admin SDK]: Ny Admin-instans skapad.');
  } catch (e: any) {
    console.error('[Admin SDK]: KRITISKT FEL - Kunde inte PARSA FIREBASE_SERVICE_ACCOUNT_JSON. Är den korrekt kopierad?', e.message);
    throw new Error('Fel vid parsning av FIREBASE_SERVICE_ACCOUNT_JSON.');
  }
} else {
  // Om en app redan finns, återanvänd den.
  console.log('[Admin SDK]: Återanvänder befintlig Firebase Admin-instans.');
  app = getApp();
}

// Exportera de färdig-initialiserade, garanterat fungerande tjänsterna direkt.
// Andra filer ska importera DESSA, inte försöka initialisera något själva.
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
