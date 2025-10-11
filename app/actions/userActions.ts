
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/admin';

// Guldstandard: Hämta specifik användarstatus för klientlogik
export async function getUserStatus(): Promise<{ onboardingComplete: boolean; tourCompleted: boolean }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        console.error("Firebase-åtgärd misslyckades: Ingen session hittades.");
        return { onboardingComplete: false, tourCompleted: false };
    }

    try {
        const userDoc = await adminDb.collection('users').doc(session.user.id).get();
        if (!userDoc.exists) {
            console.log(`Användardokument ${session.user.id} hittades inte. Returnerar standardstatus.`);
            return { onboardingComplete: false, tourCompleted: false };
        }
        const userData = userDoc.data();
        return {
            onboardingComplete: userData?.onboardingComplete || false,
            tourCompleted: userData?.tourCompleted || false,
        };
    } catch (error) {
        console.error("Fel vid hämtning av användarstatus:", error);
        return { onboardingComplete: false, tourCompleted: false };
    }
}

// =================================================================================
// GULDSTANDARD - userActions V2.0 (ROBUST DATABASHANTERING)
// REVIDERING: Byter ut den riskfyllda `update`-metoden mot `set` med `merge: true`.
// Detta förhindrar ett kritiskt fel (race condition) där funktionen kan anropas
// innan användarens dokument har skapats i Firestore. Den nya metoden är idempotent
// och säkerställer att statusen ALLTID sparas korrekt.
// =================================================================================
export async function markTourAsCompleted(): Promise<{ success: boolean }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        console.error("Firebase-åtgärd misslyckades: Ingen session hittades vid försök att markera tour.");
        return { success: false };
    }

    try {
        // ANVÄNDER .set() MED MERGE FÖR ATT VARA ROBUST
        // Detta skapar dokumentet om det saknas, annars uppdaterar det fältet.
        await adminDb.collection('users').doc(session.user.id).set({
            tourCompleted: true,
        }, { merge: true });
        
        console.log(`Användare ${session.user.id} markerades som att ha slutfört turen.`);
        return { success: true };
    } catch (error) {
        console.error("Fel vid markering av tour som slutförd:", error);
        return { success: false };
    }
}
