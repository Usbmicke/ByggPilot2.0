
import admin from 'firebase-admin';
import { env } from '@/config/env';

// =================================================================================
// ADMIN SDK V4.0 - `globalThis` SINGLETON (THE CORRECT WAY)
//
// FÖRKLARING: Tidigare försök använde `admin.apps.length` eller `global`, vilket
// är opålitligt i Next.js utvecklingsmiljö med HMR. Detta ledde till att flera
// separata instanser av Firebase-appen skapades, vilket orsakade alla de
// datakonflikter och omdirigeringsfel du har sett.
//
// Denna version använder `globalThis` för att cacha app-instansen. `globalThis` är
// en standardiserad, global variabel som är konsekvent över olika JavaScript-
// miljöer och garanterar att EXAKT samma instans återanvänds vid varje kod-omladdning.
// Detta är den slutgiltiga, korrekta lösningen för att säkerställa en stabil
// databasanslutning i Next.js.
// =================================================================================

// Definiera en typ för vår anpassade globala variabel
declare global {
  var firebaseAdminApp: admin.app.App | undefined;
}

let app: admin.app.App;

if (process.env.NODE_ENV === 'production') {
  // I produktion, anslut bara en gång.
  app = admin.initializeApp({
    credential: admin.credential.cert(env.FIREBASE_SERVICE_ACCOUNT_JSON),
    databaseURL: `https://${env.FIREBASE_SERVICE_ACCOUNT_JSON.project_id}.firebaseio.com`,
  });
} else {
  // I utveckling, använd `globalThis` för att förhindra om-initialisering.
  if (!globalThis.firebaseAdminApp) {
    globalThis.firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(env.FIREBASE_SERVICE_ACCOUNT_JSON),
      databaseURL: `https://${env.FIREBASE_SERVICE_ACCOUNT_JSON.project_id}.firebaseio.com`,
    });
    console.log("Firebase Admin SDK Initialized (Development Singleton).");
  }
  app = globalThis.firebaseAdminApp;
}

const adminDb = app.firestore();
const adminAuth = app.auth();

export { adminDb, adminAuth };
