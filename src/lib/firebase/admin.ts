
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// VIKTIGT: Denna fil får ALDRIG importeras i en klient-komponent.
// Den är endast avsedd för server-side-kod (Genkit-flöden).

const createFirebaseAdminApp = (): App => {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp();
};

export const adminApp: App = createFirebaseAdminApp();
export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
