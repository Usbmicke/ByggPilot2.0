
import { db } from '@/lib/db';
import type { User as NextAuthUser } from 'next-auth';
import { logger } from '@/lib/logger';

// =================================================================================
// DATA ACCESS: USER
//
// Funktioner för att interagera med User-modellen i databasen.
// Denna fil är en del av Data Access Layer (DAL) och ska vara den enda
// platsen där User-tabellen direkt anropas.
// =================================================================================

/**
 * Hittar en befintlig användare eller skapar en ny om den inte finns.
 * Används primärt vid inloggning.
 * @param {NextAuthUser} user - Användarobjektet från NextAuth.
 * @returns {Promise<void>} Ett löfte som resolverar när operationen är klar.
 * @throws Kastar ett fel om databasoperationen misslyckas.
 */
export const findOrCreateUser = async (user: NextAuthUser): Promise<void> => {
    if (!user || !user.id || !user.email) {
        logger.error({ message: '[DAL_USER] Ogiltigt användarobjekt vid findOrCreateUser.', user });
        throw new Error('Ogiltigt användarobjekt för findOrCreateUser.');
    }

    try {
        await db.user.upsert({
            where: { id: user.id },
            update: {
                name: user.name,
                email: user.email,
                image: user.image,
            },
            create: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                onboardingComplete: false, // Standardvärde för nya användare
            },
        });
         logger.info(`[DAL_USER] Upsert lyckades för användare: ${user.id}`);
    } catch (error) {
        logger.error({ message: `[DAL_USER] Databasfel vid upsert för användare: ${user.id}`, error, user });
        throw error; // Kasta vidare felet för att hanteras högre upp
    }
};

/**
 * Hämtar en specifik användare baserat på deras ID.
 * @param {string} id - Användarens unika ID.
 * @returns {Promise<any | null>} Användarobjektet eller null om det inte hittas.
 * @throws Kastar ett fel om databasoperationen misslyckas.
 */
export const getUserById = async (id: string): Promise<any | null> => {
    if (!id) {
        logger.warn('[DAL_USER] försök att hämta användare med tomt ID.');
        return null;
    }

    try {
        const user = await db.user.findUnique({
            where: { id },
        });
        return user;
    } catch (error) {
        logger.error({ message: `[DAL_USER] Databasfel vid hämtning av användare: ${id}`, error });
        throw error;
    }
};
