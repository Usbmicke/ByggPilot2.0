
import { firestoreAdmin as db } from '@/lib/config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';

const usersRef = db.collection('users');
const accountsRef = db.collection('accounts'); // NY: Referens till accounts-samlingen

// ... (alla existerande funktioner som createUser, updateUser, etc. förblir desamma)

/**
 * GULDSTANDARD: Hämtar ett konto-objekt från den officiella Firebase-adapterns samling.
 * Det är HÄR som access_token och refresh_token lagras.
 * @param userId Användarens ID.
 * @returns Konto-objektet om det hittas, annars null.
 */
export async function getAccountByUserId(userId: string) {
    try {
        const q = accountsRef.where('userId', '==', userId).limit(1);
        const querySnapshot = await q.get();
        if (querySnapshot.empty) {
            logger.warn(`[DAL] Inget konto hittades i 'accounts'-samlingen för användare ${userId}.`);
            return null;
        }
        const accountDoc = querySnapshot.docs[0];
        return { id: accountDoc.id, ...accountDoc.data() };
    } catch (error) {
        logger.error(`[DAL] Fel vid sökning av konto för användare ${userId}:`, error);
        throw new Error('Kunde inte söka efter konto.');
    }
}

// Existerande funktioner...
export async function findUserByEmail(email: string) {
    // ... (ingen ändring)
}

export async function getUser(userId: string) {
    // ... (ingen ändring)
}

export async function createUser(userId: string, userData: any) {
    // ... (ingen ändring)
}

export async function updateUser(userId: string, data: Record<string, any>) {
    // ... (ingen ändring)
}

export async function findOrCreateUser(profile: any) {
    // ... (ingen ändring)
}
