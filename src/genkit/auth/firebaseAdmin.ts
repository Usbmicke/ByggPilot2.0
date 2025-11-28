import * as admin from 'firebase-admin';
import { Auth, DecodedIdToken } from 'firebase-admin/auth';

// Säkerställ att Firebase Admin bara initialiseras en gång
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Använder ADC
  });
}

const adminAuth: Auth = admin.auth();

/**
 * Verifierar en Firebase ID-token och returnerar den avkodade token.
 * Kastar ett fel om token är ogiltig.
 * @param idToken - Användarens ID-token som en sträng.
 * @returns Ett löfte som resulterar i den avkodade ID-token.
 */
export const verifyIdToken = async (idToken: string): Promise<DecodedIdToken> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw new Error('Unauthorized'); // Kasta ett standardiserat fel
  }
};

export { admin };
