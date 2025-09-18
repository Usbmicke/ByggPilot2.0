
import admin from 'firebase-admin';

// ==========================================================================
// ROBUST FIREBASE ADMIN INITIALIZATION
// ==========================================================================

/**
 * This function initializes the Firebase Admin SDK. It's designed to be 
 * safe to call multiple times, which is crucial in a Next.js environment 
 * with hot-reloading.
 */
function initializeFirebaseAdmin() {
  // If the app is already initialized, don't do it again.
  if (admin.apps.length > 0) {
    return;
  }

  // Check for the required environment variable.
  // This is the modern, recommended way to handle service account credentials.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. ' +
      'Please provide the service account JSON as a single-line string.'
    );
  }

  try {
    // Parse the JSON string from the environment variable.
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize the app with the parsed credentials.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    
    console.log("Firebase Admin SDK initialized successfully.");

  } catch (error: any) {
    // Provide a more detailed error message for easier debugging.
    console.error(
        'Firebase admin initialization error. Check your FIREBASE_SERVICE_ACCOUNT_JSON format.',
        error
    );
    // Re-throw the error to make it clear that initialization failed.
    throw new Error(`Firebase admin initialization failed: ${error.message}`);
  }
}

// Initialize the app when this module is first loaded.
initializeFirebaseAdmin();

// Export the admin services for use in your API routes.
const firestore = admin.firestore();
const auth = admin.auth();

export { firestore, auth };
