
import { initializeApp, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Dessa credentials kommer automatiskt att finnas tillgängliga i Firebase-miljön.
const adminApp = getApps().length > 0 ? getApp() : initializeApp();

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
