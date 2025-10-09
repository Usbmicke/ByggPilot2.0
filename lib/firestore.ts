'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from './firebase'; // Korrigerad import

/**
 * Uppdaterar onboarding-statusen för en specifik användare i Firestore.
 * @param uid Användarens unika ID.
 * @param status Den nya onboarding-statusen (t.ex. 'complete').
 */
export const updateUserOnboardingStatus = async (uid: string, status: string): Promise<void> => {
  if (!uid) {
    throw new Error("Användar-ID krävs för att uppdatera onboarding-status.");
  }
  const userDocRef = doc(firestore, 'users', uid);
  await updateDoc(userDocRef, {
    onboardingStatus: status,
  });
};
