
import { db } from '@/lib/db';
import type { Account } from 'next-auth';
import { logger } from '@/lib/logger';

// =================================================================================
// DATA ACCESS: ACCOUNT (FIREBASE EDITION)
//
// ARKITEKTUR: Omskriven för att använda Firestore. Konton lagras nu i en
// sub-collection under varje användare för att hålla datan organiserad och säker.
// =================================================================================

/**
 * Sparar eller uppdaterar en användares kontoinformation (t.ex. från Google)
 * i en sub-collection i Firestore.
 */
export const saveOrUpdateAccount = async (account: Account): Promise<void> => {
    if (!account || !account.userId || !account.provider) {
        logger.error({ message: '[DAL_ACCOUNT] Ogiltigt eller ofullständigt konto-objekt.', account });
        throw new Error('Ogiltigt konto-objekt för saveOrUpdateAccount.');
    }

    try {
        const accountRef = db.collection('users').doc(account.userId).collection('accounts').doc(account.provider);
        
        // Ta bort userId från objektet vi sparar för att undvika redundans
        const { userId, ...accountToSave } = account;

        await accountRef.set(accountToSave, { merge: true });
        logger.info(`[DAL_ACCOUNT] Konto för provider ${account.provider} sparades för användare ${account.userId}`);

    } catch (error) {
        logger.error({ message: `[DAL_ACCOUNT] Databasfel vid sparande av konto för användare: ${account.userId}`, error, account });
        throw error;
    }
};
