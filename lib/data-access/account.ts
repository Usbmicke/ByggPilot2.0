
import { db } from '@/lib/db';
import type { Account as NextAuthAccount } from 'next-auth';
import { logger } from '@/lib/logger';

// =================================================================================
// DATA ACCESS: ACCOUNT
//
// Funktioner för att interagera med Account-modellen i databasen.
// Denna fil är en del av Data Access Layer (DAL).
// =================================================================================

/**
 * Sparar eller uppdaterar ett konto kopplat till en användare.
 * Används vid inloggning för att synka access tokens och annan kontoinformation.
 * @param {NextAuthAccount} account - Konto-objektet från NextAuth, utökat med userId.
 * @returns {Promise<void>} Ett löfte som resolverar när operationen är klar.
 * @throws Kastar ett fel om databasoperationen misslyckas.
 */
export const saveOrUpdateAccount = async (account: NextAuthAccount): Promise<void> => {
    if (!account || !account.providerAccountId || !account.userId) {
        logger.error({ message: '[DAL_ACCOUNT] Ogiltigt konto-objekt vid saveOrUpdateAccount.', account });
        throw new Error('Ogiltigt konto-objekt för saveOrUpdateAccount.');
    }

    try {
        await db.account.upsert({
            where: {
                provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                },
            },
            update: {
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                scope: account.scope,
            },
            create: {
                userId: account.userId,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
            },
        });
        logger.info(`[DAL_ACCOUNT] Upsert lyckades för konto tillhörande användare: ${account.userId}`);
    } catch (error) {
        logger.error({ message: `[DAL_ACCOUNT] Databasfel vid upsert för konto tillhörande användare: ${account.userId}`, error, account });
        throw error; // Kasta vidare felet
    }
};
