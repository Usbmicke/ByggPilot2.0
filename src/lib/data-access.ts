
import { firestoreAdmin as db } from '@/lib/config/firebase-admin';
import { logger } from '@/lib/logger';

// =================================================================================
// DATA ACCESS LAYER (DAL) - V1.1
// =================================================================================
// Denna fil hanterar all direkt interaktion med Firestore-databasen.
// Version 1.1 återinför den saknade `getAccountByUserId`-funktionen.

const usersRef = db.collection('users');
const accountsRef = db.collection('accounts'); // <-- NY REFERENS

/**
 * Uppdaterar data för en användare i 'users'-collection.
 */
export async function updateUser(userId: string, data: Record<string, any>): Promise<boolean> {
    if (!userId) {
        logger.error('[DAL] updateUser: Försök att uppdatera användare utan userId.');
        throw new Error('Användar-ID saknas.');
    }
    try {
        const userDocRef = usersRef.doc(userId);
        await userDocRef.update(data);
        logger.info(`[DAL] updateUser: Användare '${userId}' uppdaterades med data:`, data);
        return true;
    } catch (error) {
        logger.error(`[DAL] updateUser: Kritiskt fel vid uppdatering av användare '${userId}':`, { error, data });
        throw new Error('Kunde inte uppdatera användardata i databasen.');
    }
}

/**
 * Hämtar ett komplett användardokument från 'users'-collection.
 */
export async function getUser(userId: string): Promise<Record<string, any> | null> {
    if (!userId) {
        logger.warn('[DAL] getUser: Anrop med tomt userId.');
        return null;
    }
    try {
        const userDoc = await usersRef.doc(userId).get();
        if (!userDoc.exists) {
            logger.warn(`[DAL] getUser: Användare med ID '${userId}' hittades inte i Firestore.`);
            return null;
        }
        return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
        logger.error(`[DAL] getUser: Fel vid hämtning av användare '${userId}':`, error);
        throw new Error('Kunde inte hämta användardata.');
    }
}

/**
 * ÅTERSTÄLLD: Hämtar ett kontodokument från 'accounts'-collection baserat på userId.
 * Denna funktion är kritisk för Google Authentication Service.
 */
export async function getAccountByUserId(userId: string): Promise<Record<string, any> | null> {
    if (!userId) {
        logger.warn('[DAL] getAccountByUserId: Anrop med tomt userId.');
        return null;
    }
    try {
        const querySnapshot = await accountsRef.where('userId', '==', userId).limit(1).get();
        if (querySnapshot.empty) {
            logger.warn(`[DAL] getAccountByUserId: Inget konto hittades för userId '${userId}'.`);
            return null;
        }
        const accountDoc = querySnapshot.docs[0];
        return { id: accountDoc.id, ...accountDoc.data() };
    } catch (error) {
        logger.error(`[DAL] getAccountByUserId: Fel vid hämtning av konto för userId '${userId}':`, error);
        throw new Error('Kunde inte hämta kontodata.');
    }
}

