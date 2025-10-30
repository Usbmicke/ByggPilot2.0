import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/config/firebase-client';
import { Calculation } from '@/app/types/index';

/**
 * Fetches a single calculation for a specific user.
 * Requires the session to be validated beforehand.
 * @param {string} userId - The ID of the user.
 * @param {string} calculationId - The ID of the calculation to fetch.
 * @returns {Promise<Calculation | null>}
 */
export const fetchCalculation = async (userId: string, calculationId: string): Promise<Calculation | null> => {
  try {
    const calculationDocRef = doc(firestore, 'users', userId, 'calculations', calculationId);
    const calculationDoc = await getDoc(calculationDocRef);

    if (calculationDoc.exists()) {
      return calculationDoc.data() as Calculation;
    }

    return null;
  } catch (error) {
    console.error('Error fetching calculation:', error);
    // Vi kastar felet vidare för att hanteras av anroparen (t.ex. Server Action)
    throw new Error('Could not fetch calculation.');
  }
};
