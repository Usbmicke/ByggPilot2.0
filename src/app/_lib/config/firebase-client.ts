
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { validatedFirebaseConfig } from './firebase-config-validation';

const app = !getApps().length ? initializeApp(validatedFirebaseConfig) : getApp();

// Standard-initiering av Auth-objektet.
const auth = getAuth(app);
const firestore = getFirestore(app);

let analytics;

// Kör denna logik endast på klientsidan.
if (typeof window !== 'undefined') {
  // Initiera Analytics.
  if (validatedFirebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }

  // ====================================================================
  //  KORREKT KORRIGERING: SÄTT PERSISTENCE EXPLICIT
  // ====================================================================
  // Istället för att använda `initializeAuth` (vilket orsakade felen),
  // använder vi `setPersistence` på det befintliga auth-objektet.
  // Detta talar om för Firebase att spara användarens session i webbläsaren
  // så att den överlever sidomladdningar.
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('[Firebase Client]: Persistence är satt till local.');
    })
    .catch((error) => {
      console.error('[Firebase Client]: Kunde inte sätta persistence.', error);
    });
  // ====================================================================
}

console.log("[Firebase Client]: Ansluten till LIVE Firebase.");

export { app, auth, firestore, analytics };
