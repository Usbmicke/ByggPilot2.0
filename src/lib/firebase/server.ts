import 'server-only';
import * as admin from 'firebase-admin';

// Konfiguration för Firebase Admin SDK
const firebaseConfig = {
  credential: admin.credential.applicationDefault(), // Använder Google Application Default Credentials
  // Om du inte använder ADC, kan du specificera serviceAccountKey här:
  // credential: admin.credential.cert(require('./path/to/your/serviceAccountKey.json')),
};

// Initialisera Firebase Admin SDK om det inte redan har gjorts
if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

// Exportera den initialiserade Firestore-instansen för användning i Repositories
export const firestore = admin.firestore();

// Exportera Auth-instansen för token-validering
export const auth = admin.auth();

/**
 * Validerar en Firebase ID-token med Admin SDK.
 * @param token Användarens ID-token (utan 'Bearer ').
 * @returns Den avkodade token-informationen.
 */
export async function decodeIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw new Error('Invalid authentication token.');
  }
}
