
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { validatedFirebaseConfig } from './firebase-config-validation';

// Initiera appen mot live-miljön.
const app = !getApps().length ? initializeApp(validatedFirebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore(app);

let analytics;
// Initiera Analytics endast i webbläsaren.
if (typeof window !== 'undefined' && validatedFirebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

console.log("[Firebase Client]: Ansluten till LIVE Firebase.");

export { app, auth, firestore, analytics };
