
import admin from 'firebase-admin';
import logger from './logger';
import { env } from '@/config/env'; // Importera den centraliserade och validerade env-konfigurationen

// =================================================================================
// ADMIN SDK V4.0 - FRAMTIDSSÄKER OCH ROBUST SINGLETON
// ARKITEKTUR: Denna version är den slutgiltiga, robusta lösningen som löser
// grundorsaken till autentiseringsfelen. Den använder den centraliserade
// `env`-konfigurationen från `config/env.ts` och implementerar en kritisk
// korrigering för `private_key`.
//
// FÖRBÄTTRINGAR:
// 1. CENTRALISERAD KONFIGURATION: All miljölogik är nu samlad i `config/env.ts`.
//    Denna fil läser inte längre `process.env` direkt, vilket minskar risken för
//    konflikter och stavfel (t.ex. `_KEY` vs `_JSON`).
// 2. KRITISK NYCKELKORRIGERING: Implementerar en programmatisk ersättning av
//    `\n` med `\n` i `private_key`. Detta säkerställer att Firebase Admin SDK
//    alltid får en korrekt formaterad nyckel, oavsett hur den lagras i `.env.local`.
// =================================================================================

declare global {
  var firebaseAdminInstance: admin.app.App | undefined;
}

function getFirebaseAdmin() {
  if (global.firebaseAdminInstance) {
    return global.firebaseAdminInstance;
  }

  try {
    logger.info("Initierar ny Firebase Admin SDK-instans...");

    // Hämta den redan tolkade och validerade service account-datan från env
    const serviceAccount = env.FIREBASE_SERVICE_ACCOUNT_JSON;

    // **DEN AVGÖRANDE FIXEN:**
    // Ersätt de literala '\n'-strängarna från .env-filen med faktiska radbrytningstecken.
    const formattedPrivateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

    global.firebaseAdminInstance = admin.initializeApp({
      credential: admin.credential.cert({
        ...serviceAccount,
        private_key: formattedPrivateKey, // Använd den korrigerade nyckeln
      })
    });

    logger.info("Firebase Admin SDK har initierats framgångsrikt.");

  } catch (error: any) {
    logger.error({
        message: "Allvarligt fel under initiering av Firebase Admin. Applikationen kommer inte fungera korrekt.",
        error: error.message
    });
    throw error; // Kasta felet vidare för att förhindra att servern startar i ett trasigt tillstånd.
  }

  return global.firebaseAdminInstance;
}

// Exportera de initierade tjänsterna
const adminApp = getFirebaseAdmin();
const adminDb = adminApp.firestore();
const adminAuth = adminApp.auth();

export { adminDb, adminAuth };
