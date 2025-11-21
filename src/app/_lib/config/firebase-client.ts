
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { validatedFirebaseConfig } from './firebase-config-validation';

const app = !getApps().length ? initializeApp(validatedFirebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore(app);

// ====================================================================
//  EMULATOR-ANSLUTNING (ENDAST FÖR LOKAL UTVECKLING)
// ====================================================================
// Om vi är i utvecklingsläge (och inte i en testmiljö som Jest),
// anslut till de lokala Firebase-emulatorerna. Detta förhindrar att
// vi använder riktig data under utveckling och ger oss insyn via
// emulator-UI:n.
if (process.env.NODE_ENV === 'development') {
  console.log("INFO: Ansluter till Firebase Emulator Suite...");

  // Viktig kontroll för att undvika "hot-reload"-fel i Next.js
  // Vi vill bara ansluta en gång, inte vid varje omladdning.
  if (!auth.emulatorConfig) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log("  -> Auth Emulator ansluten på http://localhost:9099");
    } catch (e) {
      console.error("Auth Emulator connection error:", e)
    }
  }

  // @ts-ignore - _settings.host är ett internt men tillförlitligt sätt att kolla.
  if (!firestore._settings.host.startsWith('localhost')) {
    try {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      console.log("  -> Firestore Emulator ansluten på http://localhost:8080");
    } catch (e) {
      console.error("Firestore Emulator connection error:", e)
    }
  }
}

let analytics;
if (typeof window !== 'undefined' && validatedFirebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

export { app, auth, firestore, analytics }; // Exportera firestore också
