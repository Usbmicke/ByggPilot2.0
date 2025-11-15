import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onUserCreate } from 'firebase-functions/v2/identity';

// Initialisera Firebase Admin SDK, men bara om det inte redan har gjorts.
if (getApps().length === 0) {
  initializeApp();
}

/**
 * En v2 Cloud Function som triggas när en ny Firebase-användare skapas.
 * Den skapar automatiskt ett motsvarande användardokument i Firestore.
 * Funktionen exporteras för att Firebase ska kunna upptäcka den.
 */
export const makeuserdocument = onUserCreate({ region: 'europe-west1' }, async (event) => {
  const user = event.data;
  const { uid, email, displayName, photoURL } = user;

  console.log(`Ny användare skapades: ${uid}`);

  const userDocRef = getFirestore().collection('users').doc(uid);

  try {
    await userDocRef.set({
      email: email,
      displayName: displayName || null,
      photoURL: photoURL || null,
      createdAt: new Date(),
      onboardingStatus: 'incomplete',
    });
    console.log(`Firestore-dokument skapat för användare: ${uid}`);
  } catch (error) {
    console.error(`Fel vid skapande av Firestore-dokument för ${uid}:`, error);
  }
});
