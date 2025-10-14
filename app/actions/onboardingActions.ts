
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { adminDb } from '@/lib/admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { google } from 'googleapis';
import { rateLimiter } from '@/lib/rate-limiter';
import logger from '@/lib/logger'; // Importera vår nya logger

// Schema är oförändrat
const companyProfileSchema = z.object({
    companyName: z.string().min(2, 'Företagsnamn är ogiltigt'),
    streetAddress: z.string().min(2, 'Gatuadress är ogiltig'),
    postalCode: z.string().min(5, 'Postnummer är ogiltigt').max(6, 'Postnummer är för långt'),
    city: z.string().min(2, 'Ort är ogiltig'),
    orgnr: z.string().optional(),
    phone: z.string().optional(),
});

export async function updateCompanyProfile(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        logger.warn('updateCompanyProfile anropades utan session.');
        return { success: false, error: 'Autentisering misslyckades.' };
    }
    const userId = session.user.id;

    // Rate Limiter
    const { success: limitReached } = await rateLimiter.limit(userId);
    if (!limitReached) {
        logger.warn({ userId }, 'Rate limit överskreds för updateCompanyProfile.');
        return { success: false, error: 'För många anrop, försök igen om en stund.' };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validationResult = companyProfileSchema.safeParse(rawData);

    if (!validationResult.success) {
        logger.warn({ userId, errors: validationResult.error.flatten() }, 'Validering misslyckades för updateCompanyProfile.');
        return { success: false, error: 'Ogiltig data.' };
    }
    
    logger.info({ userId, data: validationResult.data }, 'Försöker uppdatera företagsprofil...');
    try {
        await adminDb.collection('users').doc(userId).set({ company: { ...validationResult.data }, onboardingStep: 1 }, { merge: true });
        revalidatePath('/onboarding');
        logger.info({ userId }, 'Företagsprofil uppdaterad framgångsrikt.');
        return { success: true };
    } catch (error: any) {
        logger.error({ userId, error: error.message, stack: error.stack }, 'Databasfel vid uppdatering av företagsprofil.');
        return { success: false, error: 'Databasfel.' };
    }
}

// ... andra funktioner ...

export async function completeOnboarding() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        logger.warn('completeOnboarding anropades utan session.');
        return { success: false, error: 'Autentisering misslyckades.' };
    }
    const userId = session.user.id;

    // Rate Limiter
    const { success: limitReached } = await rateLimiter.limit(userId);
    if (!limitReached) {
        logger.warn({ userId }, 'Rate limit överskreds för completeOnboarding.');
        return { success: false, error: 'För många anrop, försök igen om en stund.' };
    }

    logger.info({ userId }, 'Försöker slutföra onboarding...');
    try {
        await adminDb.collection('users').doc(userId).set({ onboardingComplete: true, onboardingStep: 3 }, { merge: true });
        revalidatePath('/dashboard');
        logger.info({ userId }, 'Onboarding slutförd framgångsrikt.');
        return { success: true };
    } catch (error: any) {
        logger.error({ userId, error: error.message, stack: error.stack }, 'Kunde inte slutföra onboarding.');
        return { success: false, error: 'Kunde inte slutföra onboarding.' };
    }
}
