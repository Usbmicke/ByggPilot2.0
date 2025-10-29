
import * as admin from 'firebase-admin';

// VÄRLDSKLASS-ARKITEKTUR: Lazy export.
// Variablerna deklareras men tilldelas bara värden om appen kan initialiseras.
// Detta förhindrar krascher vid import under byggtid.

let db: admin.firestore.Firestore;
let firestoreAdmin: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });

  // Tilldela värden först efter lyckad initialisering
  db = admin.firestore();
  firestoreAdmin = admin.firestore();
  auth = admin.auth();
}

// TypeScript kan klaga på att dessa är "possibly unassigned",
// men detta är avsiktligt för att skilja på bygg- och körtid.
// @ts-ignore
export { db, firestoreAdmin, auth, admin };
