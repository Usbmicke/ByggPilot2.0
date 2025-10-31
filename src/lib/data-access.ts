
import { firestoreAdmin as db } from '@/lib/config/firebase-admin';
import { logger } from '@/lib/logger';
import { UserSchema } from './types'; // <-- STEG 2: IMPORTERAR RITNINGEN

// =================================================================================
// DATA ACCESS LAYER (DAL) - V2.0 (Armerad)
// =================================================================================
// Denna version är armerad med Zod-validering för att garantera dataintegritet.

const usersRef = db.collection('users');
const accountsRef = db.collection('accounts');

/**
 * Uppdaterar data för en användare. All data valideras nu mot UserSchema
 * innan den skrivs till databasen.
 */
export async function updateUser(userId: string, data: Record<string, any>): Promise<boolean> {
    if (!userId) {
        logger.error('[DAL] updateUser: Försök att uppdatera användare utan userId.');
        throw new Error('Användar-ID saknas.');
    }

    // STEG 2: VALIDERINGSVAKT
    // .partial() tillåter att endast en delmängd av fälten skickas in för uppdatering.
    const validationResult = UserSchema.partial().safeParse(data);

    if (!validationResult.success) {
        logger.error(
            `[DAL] updateUser: Valideringsfel för användare '${userId}'. Datan matchar inte UserSchema.`, 
            { errors: validationResult.error.flatten() }
        );
        throw new Error('Datavalideringen misslyckades. Ogiltig data skickades till databasen.');
    }

    try {
        const userDocRef = usersRef.doc(userId);
        // Använder validationResult.data för att säkerställa att endast validerad data används.
        await userDocRef.update(validationResult.data);
        logger.info(`[DAL] updateUser: Användare '${userId}' uppdaterades framgångsrikt med validerad data.`);
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
 * Hämtar ett kontodokument från 'accounts'-collection baserat på userId.
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
