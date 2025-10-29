import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/config/firebase-client';

/**
 * Updates the hourly rate for a specific user.
 * @param {string} userId - The ID of the user to update.
 * @param {number} hourlyRate - The new hourly rate.
 * @returns {Promise<void>}
 */
export const updateUserHourlyRate = async (userId: string, hourlyRate: number): Promise<void> => {
  const userDocRef = doc(firestore, 'users', userId);
  await updateDoc(userDocRef, { hourlyRate });
};
