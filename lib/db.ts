
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const adminAuth = admin.auth();

// Exportera admin-instansen av firestore för operationer som kräver förhöjd behörighet
const adminDb = admin.firestore();

export { db, admin, adminAuth, adminDb };
