
import admin from 'firebase-admin';

// Säkerställ att vi inte försöker initiera appen flera gånger i utvecklingsmiljön (pga. hot-reloading)
if (!admin.apps.length) {
  // Hämta credentials från miljövariabler. Denna variabel måste vara en JSON-sträng.
  const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG;
  if (!serviceAccount) {
    throw new Error('Firebase Admin SDK config not found in environment variables.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
  });
} else {
  // Om appen redan finns, använd den befintliga instansen
  admin.app(); 
}

// Exportera de nödvändiga admin-modulerna för enkel åtkomst i andra server-side filer.
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
