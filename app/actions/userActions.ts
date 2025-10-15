'use server';

// KORRIGERING: Importera getServerSession och authOptions
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { adminDb } from '@/lib/admin';

// Guldstandard: Hämta specifik användarstatus för klientlogik
export async function getUserStatus(): Promise<{ onboardingComplete: boolean; tourCompleted: boolean }> {
    // KORRIGERING: Använd den korrekta metoden för v4
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

// Guldstandard: Markera tour som slutförd
export async function markTourAsCompleted(): Promise<{ success: boolean }> {
    // KORRIGERING: Använd den korrekta metoden för v4
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        console.error("Firebase-åtgärd misslyckades: Ingen session hittades vid försök att markera tour.");
        return { success: false };
    }

    try {
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
