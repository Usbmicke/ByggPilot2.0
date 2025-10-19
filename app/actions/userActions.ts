'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getUserStatus as getUserStatusFromDAL, markTourAsCompleted as markTourAsCompletedFromDAL } from '@/lib/data-access';
import logger from '@/lib/logger';

/**
 * Guldstandard: Server Action för att hämta användarstatus.
 * Denna action hanterar sessionen och anropar sedan DAL för att hämta data.
 */
export async function getUserStatus(): Promise<{ onboardingComplete: boolean; tourCompleted: boolean }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        logger.error("[Action - getUserStatus] Åtkomst nekad: Ingen session hittades.");
        // På klientsidan är det ofta bättre att returnera ett standardvärde än att kasta ett fel.
        return { onboardingComplete: false, tourCompleted: false };
    }

    try {
        // Anropar DAL-funktionen med användar-ID från sessionen.
        return await getUserStatusFromDAL(session.user.id);
    } catch (error) {
        logger.error({ 
            message: "[Action - getUserStatus] Fel vid hämtning av användarstatus", 
            userId: session.user.id, 
            error: error instanceof Error ? error.message : String(error)
        });
        return { onboardingComplete: false, tourCompleted: false };
    }
}

/**
 * Guldstandard: Server Action för att markera guiden som slutförd.
 * Denna action hanterar sessionen och anropar sedan DAL för att utföra skrivningen.
 */
export async function markTourAsCompleted(): Promise<{ success: boolean }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        logger.error("[Action - markTourAsCompleted] Åtkomst nekad: Ingen session hittades.");
        return { success: false };
    }

    try {
        // Anropar DAL-funktionen med användar-ID från sessionen.
        return await markTourAsCompletedFromDAL(session.user.id);
    } catch (error) {
        logger.error({ 
            message: "[Action - markTourAsCompleted] Fel vid markering av tour som slutförd", 
            userId: session.user.id, 
            error: error instanceof Error ? error.message : String(error)
        });
        return { success: false };
    }
}
