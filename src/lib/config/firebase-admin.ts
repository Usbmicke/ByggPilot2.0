
import * as admin from 'firebase-admin';
import { logger } from '@/lib/logger'; // Importera den centrala loggern

// GULDSTANDARD: Deklarera variablerna som kan vara odefinierade initialt.
let firestoreAdmin: admin.firestore.Firestore;
let auth: admin.auth.Auth;

// Singleton-mönster för att förhindra ominitialisering i serverless-miljöer.
if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
    }

    // HÄRDAD KOD: Sanera input-strängen innan den parsas.
    // Detta gör systemet motståndskraftigt mot vanliga copy-paste-fel där
    // extra citattecken inkluderas i miljövariabeln.
    let jsonString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (jsonString.startsWith("'") && jsonString.endsWith("'")) {
        jsonString = jsonString.substring(1, jsonString.length - 1);
    }
    
    const serviceAccount = JSON.parse(jsonString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firestoreAdmin = admin.firestore();
    auth = admin.auth();
    logger.info('[Firebase Admin] Singleton initialized successfully.');

  } catch (error) {
    // Använd strukturerad loggning för kritiska fel.
    logger.error('[Firebase Admin CRITICAL] Failed to initialize Firebase Admin SDK', {
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack,
    });
    // Kasta om felet för att förhindra att applikationen startar med en felaktig konfiguration.
    throw error;
  }
} else {
  // Om redan initialiserad, hämta instanserna. Detta är viktigt för Next.js Fast Refresh.
  firestoreAdmin = admin.apps[0]!.firestore();
  auth = admin.apps[0]!.auth();
}

// Exportera de initialiserade instanserna.
export { firestoreAdmin, auth };
