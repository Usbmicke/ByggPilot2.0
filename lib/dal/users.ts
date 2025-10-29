
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { AdapterUser } from 'next-auth/adapters';

const adapter = FirestoreAdapter(firestoreAdmin);

/**
 * Hämtar ett komplett användarobjekt från databasen.
 * @param {string} userId - Användarens ID.
 * @returns {Promise<AdapterUser | null>}
 */
export const getUser = async (userId: string): Promise<AdapterUser | null> => {
  const user = await adapter.getUser(userId);
  return user;
};

/**
 * Uppdaterar ett användardokument i Firestore.
 * @param {string} userId - Användarens ID.
 * @param {object} data - Fälten att uppdatera.
 */
export const updateUser = async (userId: string, data: object): Promise<void> => {
  const userDocRef = firestoreAdmin.collection('users').doc(userId);
  await userDocRef.update(data);
};

/**
 * Hämtar en användares refresh token från databasen.
 * @param {string} userId - Användarens ID.
 * @returns {Promise<string | null>}
 */
export const getUserRefreshToken = async (userId: string): Promise<string | null> => {
    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
        return null;
    }

    const userData = userDoc.data();
    return userData?.refreshToken || null;
};
