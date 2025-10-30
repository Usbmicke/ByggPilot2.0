
import { firestoreAdmin as db } from '@/lib/config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore'; // KORRIGERING: Importera FieldValue direkt från källan.
import { logger } from '@/lib/logger';

// Referens till användarkollektionen
const usersRef = db.collection('users');

/**
 * Hittar en användare via e-postadress med Admin SDK.
 * @param email Användarens e-post.
 * @returns Användardata om den hittas, annars null.
 */
export async function findUserByEmail(email: string) {
    try {
        const q = usersRef.where('email', '==', email).limit(1);
        const querySnapshot = await q.get();
        if (querySnapshot.empty) {
            return null;
        }
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
        logger.error(`[DAL] Fel vid sökning av användare med e-post ${email}:`, error);
        throw new Error('Kunde inte söka efter användare.');
    }
}

/**
 * Hämtar en användare via ID med Admin SDK.
 * @param userId Användarens unika ID.
 * @returns Användardata om den hittas, annars null.
 */
export async function getUser(userId: string) {
    try {
        const userRef = usersRef.doc(userId);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
            return { id: userId, ...userSnap.data() };
        }
        logger.info(`[DAL] Användare med ID ${userId} hittades inte (förväntat vid ny användare).`);
        return null;
    } catch (error) {
        logger.error(`[DAL] Allvarligt fel vid hämtning av användare ${userId}:`, error);
        throw new Error('Kunde inte hämta användardata på grund av ett serverfel.');
    }
}

/**
 * Skapar en ny användare i databasen med Admin SDK.
 * @param userId ID för den nya användaren.
 * @param userData Användardata att skapa.
 * @returns Den nyskapade användarens data.
 */
export async function createUser(userId: string, userData: any) {
    const userRef = usersRef.doc(userId);
    const newUser = {
        ...userData,
        createdAt: FieldValue.serverTimestamp(), // KORRIGERING
        updatedAt: FieldValue.serverTimestamp(), // KORRIGERING
    };
    await userRef.set(newUser);
    return { id: userId, ...newUser }; 
}

/**
 * Uppdaterar ett användardokument i Firestore med Admin SDK.
 * @param userId Användarens ID.
 * @param data Datan som ska uppdateras.
 */
export async function updateUser(userId: string, data: Record<string, any>) {
    if (!userId) {
        throw new Error('Ett användar-ID måste anges för att kunna uppdatera användaren.');
    }
    const userRef = usersRef.doc(userId);
    try {
        await userRef.update({
            ...data,
            updatedAt: FieldValue.serverTimestamp() // KORRIGERING
        });
        logger.info(`[DAL] Användare ${userId} har uppdaterats.`);
    } catch (error) {
        logger.error(`[DAL] Det gick inte att uppdatera användare ${userId}:`, error);
        throw new Error('Databasuppdateringen för användaren misslyckades.');
    }
}

/**
 * Hittar en användare via ID eller skapar en ny om den inte finns.
 * Detta är den primära funktionen som används av NextAuth signIn-callbacken.
 * Använder nu uteslutande Admin SDK för robust och korrekt hantering.
 * @param profile Användarprofilen från OAuth-providern (Google).
 * @returns Användarens data från databasen.
 */
export async function findOrCreateUser(profile: any) {
    const userId = profile.id || profile.sub;

    if (!userId) {
        logger.error('[DAL] Provider-profilen saknar ett unikt ID (sub).', profile);
        throw new Error('Provider-profilen saknar ett unikt ID.');
    }

    const user = await getUser(userId);

    if (user) {
        logger.info(`[DAL] Befintlig användare ${userId} loggade in.`);
        return user;
    }

    logger.info(`[DAL] Användaren finns inte. Skapar ny användare med ID: ${userId}`);
    const newUserPayload = {
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        providerId: userId,
        hasCompletedOnboarding: false,
    };

    return await createUser(userId, newUserPayload);
}
