import admin from 'firebase-admin';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// --- UNIKT NAMN FÖR ATT FÖRHINDRA KONFLIKTER ---
const ADMIN_APP_NAME = '__BYGGPILOT_ADMIN__';

function getAdminApp(): admin.app.App {
  // Om appen med vårt unika namn redan finns, returnera den.
  if (getApps().find((app) => app.name === ADMIN_APP_NAME)) {
    return getApp(ADMIN_APP_NAME);
  }

  // Annars, skapa en ny instans med våra credentials.
  console.log(`Skapar en NY Firebase Admin App-instans: ${ADMIN_APP_NAME}`);

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FATALT: FIREBASE_SERVICE_ACCOUNT_JSON är inte satt i miljön.');
  }

  // --- DIAGNOSTISK LOGGNING ---
  // Loggar rådata för att verifiera formateringen av miljövariabeln.
  console.log('--- Start av Rå FIREBASE_SERVICE_ACCOUNT_JSON ---');
  console.log(serviceAccountJson);
  console.log('--- Slut på Rå FIREBASE_SERVICE_ACCOUNT_JSON ---');
  // --- SLUT PÅ DIAGNOSTISK LOGGNING ---

  try {
    // Parsa JSON-strängen direkt.
    // Miljövariabeln MÅSTE vara en korrekt formaterad JSON-sträng på en enda rad,
    // med alla radbrytningar i private_key escapade som \n.
    const parsedServiceAccount = JSON.parse(serviceAccountJson);

    return initializeApp(
      {
        credential: admin.credential.cert(parsedServiceAccount),
      },
      ADMIN_APP_NAME
    );
  } catch (error: any) {
    console.error('--- ALLVARLIGT FEL VID FIREBASE ADMIN INITIERING ---');
    console.error('Kunde inte parsa FIREBASE_SERVICE_ACCOUNT_JSON. Kontrollera att variabeln i din .env.local är en giltig JSON-sträng på en enda rad.');
    console.error('Felmeddelande:', error.message);
    throw new Error('Stoppar applikationen på grund av felaktig Firebase Admin-konfiguration.');
  }
}

// Exportera de autentiserade tjänsterna från vår unika, säkra app-instans.
export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

console.log(`Firebase Admin SDK redo för projekt: ${adminApp.options.projectId}`);
