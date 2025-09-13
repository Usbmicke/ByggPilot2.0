
import { db } from '@/app/lib/firebase/firebaseAdmin';
import { getApps, getApp } from 'firebase-admin/app';

// Denna funktion behövs inte längre här eftersom vi importerar en redan konfigurerad 'db'-instans.
// Vi behåller getAdminApp ifall någon annan del av koden är beroende av den.
const getAdminApp = () => {
  if (getApps().length) {
    return getApp();
  }
  // Denna gren bör teoretiskt sett aldrig nås nu, eftersom firebaseAdmin.ts
  // redan har kört och initierat appen.
  console.error("Attempted to initialize Firebase Admin from firestoreService, but it should already be initialized.");
  // Vi kan inte initiera här eftersom vi inte har serviceAccount-logiken längre.
  // Detta är avsiktligt för att centralisera logiken.
  throw new Error("Firebase Admin SDK is not initialized.");
};

export { db, getAdminApp };

