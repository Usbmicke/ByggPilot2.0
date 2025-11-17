// src/lib/config/firebase-admin.ts
import admin from 'firebase-admin';
import { getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

interface AdminApp {
  app: App;
  auth: Auth;
  db: Firestore;
}

// Global cache
let adminAppInstance: AdminApp | null = null;

export function initializeAdminApp(): AdminApp {
  // Om appen redan är initierad (via cache eller hot-reload), återanvänd den.
  if (adminAppInstance) {
    return adminAppInstance;
  }
  if (getApps().length > 0) {
    const app = getApp();
    adminAppInstance = {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
    };
    return adminAppInstance;
  }

  // --- HÄR ÄR DEN NYA, SYNKRONA LOGIKEN ---
  
  // Läs de separata miljövariablerna
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Ersätt alla \n med faktiska radbrytningar för Admin SDK
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('FATAL: Firebase Admin environment variables (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY) are not set in .env.local');
  }

  try {
    const app = initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId: projectId, // Sätt projectId här också
    });

    console.log(`Firebase Admin SDK successfully initialized for project: ${app.options.projectId}`);

    adminAppInstance = {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
    };
    return adminAppInstance;

  } catch (error: any) {
    console.error('--- CRITICAL FIREBASE ADMIN INITIALIZATION FAILURE ---');
    console.error('Error:', error.message);
    throw new Error('Application stopped due to invalid Firebase Admin configuration.');
  }
}
