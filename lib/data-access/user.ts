
import { db } from '@/lib/db';
import type { User as NextAuthUser } from 'next-auth';
import { logger } from '@/lib/logger';
import { User } from '@/models/user';

const usersCollection = db.collection('users');

/**
 * Hittar en befintlig användare eller skapar en ny i Firestore.
 * VIKTIGT: Returnerar nu den fullständiga användarprofilen för att
 * undvika race conditions i NextAuth-callbacks.
 */
export const findOrCreateUser = async (user: NextAuthUser): Promise<User> => {
    if (!user || !user.id || !user.email) {
        logger.error({ message: '[DAL_USER] Ogiltigt användarobjekt vid findOrCreateUser.', user });
        throw new Error('Ogiltigt användarobjekt för findOrCreateUser.');
    }

    try {
        const userRef = usersCollection.doc(user.id);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
            const existingUser = userSnapshot.data() as User;
            logger.info(`[DAL_USER] Användare hittad: ${user.id}`);
            // Uppdatera med senaste info från Google i bakgrunden (behöver inte vänta på detta)
            userRef.update({
                name: user.name,
                email: user.email,
                image: user.image,
            });
            return existingUser;

        } else {
            const newUser: User = {
                id: user.id,
                email: user.email!,
                name: user.name,
                image: user.image,
                onboardingComplete: false,
                createdAt: new Date(),
            };
            await userRef.set(newUser);
            logger.info(`[DAL_USER] Ny användare skapad: ${user.id}`);
            return newUser;
        }
    } catch (error) {
        logger.error({ message: `[DAL_USER] Databasfel vid findOrCreateUser för ${user.id}`, error });
        throw error;
    }
};

/**
 * Hämtar en specifik användare från Firestore baserat på ID.
 */
export const getUserById = async (id: string): Promise<User | null> => {
    if (!id) {
        logger.warn('[DAL_USER] försök att hämta användare med tomt ID.');
        return null;
    }

    try {
        const userRef = usersCollection.doc(id);
        const doc = await userRef.get();

        if (!doc.exists) {
            logger.warn(`[DAL_USER] Användare med id ${id} hittades inte i Firestore.`);
            return null;
        }

        return doc.data() as User;
    } catch (error) {
        logger.error({ message: `[DAL_USER] Databasfel vid hämtning av användare: ${id}`, error });
        throw error;
    }
};
