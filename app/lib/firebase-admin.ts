
// Fil: app/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// =========================================================================
// === AVGÖRANDE FÖRÄNDRING FÖR EN ROBUST AUTENTISERING =====================
// =========================================================================
//
// Vi överger de separata miljövariablerna (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)
// som är extremt känsliga för formateringsfel.
//
// Istället använder vi EN ENDA miljövariabel: `FIREBASE_SERVICE_ACCOUNT_JSON`
//
// Denna variabel ska innehålla HELA innehållet från din Firebase service account
// JSON-fil, inkapslat i enkla citattecken. Detta eliminerar alla problem 
// med radbrytningar och specialtecken.
//
// I din .env.local-fil ska det se ut så här:
// FIREBASE_SERVICE_ACCOUNT_JSON='''{
//   "type": "service_account",
//   "project_id": "ditt-projekt-id",
//   "private_key_id": "din-nyckel-id",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nDIN\nLÅNGA\nNYCKEL\n-----END PRIVATE KEY-----\n",
//   "client_email": "din-service-account-email",
//   "client_id": "ditt-client-id",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "din-cert-url"
// }'''
//
// OBS: Det är Kritiskt att hela JSON-objektet är omgivet av '''.
// =========================================================================

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    throw new Error('Miljövariabeln FIREBASE_SERVICE_ACCOUNT_JSON är inte satt. Se instruktionerna i `app/lib/firebase-admin.ts`.');
  }

  // Parse the stringified JSON from the environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  if (!getApps().length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialiserades framgångsrikt med den nya metoden.");
  }
} catch (error: any) {
  console.error("FATALT FEL vid initialisering av Firebase Admin SDK:", error.message);
  // We throw the error to prevent the app from running with a broken configuration.
  throw error; 
}

const firestoreAdmin = admin.firestore();

export { firestoreAdmin };
