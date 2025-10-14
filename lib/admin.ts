
import admin from 'firebase-admin';
import logger from './logger'; // Importera vår nya logger

// =================================================================================
// ADMIN SDK V1.1 - INSTRUMENTERAD MED LOGGER
// ARKITEKTUR: Ersatt `console.log` med strukturerad, nivå-baserad loggning.
// 1. **Informativ Loggning:** `logger.info` används för att tydligt markera när
//    initiering sker. Detta är en standardhändelse.
// 2. **Kritisk Felloggning:** `logger.error` används inuti catch-blocket.
//    Om initieringen kraschar, kommer detta att generera en högt prioriterad,
//    strukturerad logg som är lätt att hitta och agera på.
// =================================================================================

if (!admin.apps.length) {
  try {
    logger.info("Försöker initiera Firebase Admin SDK...");
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string))
    });
    logger.info("Firebase Admin SDK har initierats framgångsrikt.");
  } catch (error: any) {
    logger.error({ 
      message: "KRITISKT FEL: Kunde inte initiera Firebase Admin SDK.", 
      error: error.message, 
      stack: error.stack 
    }, "Firebase Admin initiering misslyckades.");
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
