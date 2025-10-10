
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/admin';

// Guldstandard: Hämta specifik användarstatus för klientlogik
export async function getUserStatus(): Promise<{ onboardingComplete: boolean; tourCompleted: boolean }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        // I ett verkligt scenario, hantera detta fel mer robust
        return { onboardingComplete: false, tourCompleted: false };
    }

    try {
        const userDoc = await adminDb.collection('users').doc(session.user.id).get();
        if (!userDoc.exists) {
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

// Guldstandard: Markera en specifik milstolpe för användaren
export async function markTourAsCompleted(): Promise<{ success: boolean }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false };
    }

    try {
        await adminDb.collection('users').doc(session.user.id).update({
            tourCompleted: true,
        });
        return { success: true };
    } catch (error) {
        console.error("Fel vid markering av tour som slutförd:", error);
        return { success: false };
    }
}
