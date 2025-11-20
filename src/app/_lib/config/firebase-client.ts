
// ====================================================================
// KLIENT-SIDA FIREBASE KONFIGURATION (FÖR WEBLÄSAREN)
// (VERSION 2.0 - ANVÄNDER VALIDERAD KONFIGURATION)
// ====================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { validatedFirebaseConfig } from './firebase-config-validation'; // Importera den validerade konfigurationen

// Initiera Firebase App - säkerställer att det bara görs en gång
// Använder den för-validerade konfigurationen. Om detta steg körs,
// vet vi att konfigurationen är komplett och korrekt.
const app = !getApps().length ? initializeApp(validatedFirebaseConfig) : getApp();

// Hämta den stabila singleton-instansen av Auth.
// Denna enda rad hanterar all nödvändig initialisering.
const auth = getAuth(app);

// Initiera Analytics endast i webbläsaren och om measurementId finns
let analytics;
if (typeof window !== 'undefined' && validatedFirebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

export { app, auth, analytics };
