
import admin from 'firebase-admin';
import { env } from '@/config/env';

// =================================================================================
// DATABAS-KÄRNA V2.0 (FIREBASE)
//
// ARKITEKTUR: Detta är den nya, centrala punkten för all databasinteraktion.
// Den gamla Prisma-klienten har tagits bort och ersatts med Firebase Admin SDK.
//
// LÖSNING: Vi säkerställer att vi bara initialiserar en instans av appen
// (singleton pattern) för att undvika fel och optimera prestanda. Vi exporterar
// sedan en referens till Firestore-databasen (`db`) och själva admin-objektet
// för andra Firebase-tjänster (t.ex. Auth, Storage).
// =================================================================================

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(env.FIREBASE_SERVICE_ACCOUNT_JSON),
  });
}

const db = admin.firestore();
const adminAuth = admin.auth();

export { db, admin, adminAuth };

