
import * as admin from 'firebase-admin';

// This file is the single source of truth for the Firebase Admin SDK.
// It ensures that the SDK is initialized only once.

// Check if the app is already initialized to prevent errors in hot-reloading environments.
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('Firebase Admin SDK initialized successfully.');

  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // It's critical to throw the error during startup if initialization fails.
    // Otherwise, the application will run in a broken state.
    throw new Error("Could not initialize Firebase Admin SDK. Check your FIREBASE_SERVICE_ACCOUNT_JSON.");
  }
}

// Export the initialized services to be used throughout the backend (DAL, Genkit tools, etc.).
export const firestore = admin.firestore();
export const auth = admin.auth();
