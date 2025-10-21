
'use server';

import { db } from '@/lib/db'; // <-- KORREKT DATABASANSLUTNING
import { logger } from '@/lib/logger';

// =================================================================================
// USER ACTIONS V2.0 - PLATINUM STANDARD
// REVIDERING: Fullständig sanering. All användning av `adminDb` är borttagen och
// ersatt med den korrekta, standardiserade `db`-anslutningen. Detta löser de
// tysta felen vid databasuppdateringar. Tidsstämplar är nu standardiserade.
// =================================================================================

interface CompanyFormData {
  companyName: string;
  orgNumber: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
}

// Uppdaterar företagsinformation för en användare.
export async function updateCompanyInfo(formData: CompanyFormData, userId: string) {
  if (!userId) {
    logger.error('[ACTION_USER] updateCompanyInfo anropades utan userId.');
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const userDocRef = db.collection('users').doc(userId);
    
    const saveData = {
      company: {
        name: formData.companyName,
        orgNumber: formData.orgNumber,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        phone: formData.phone,
      },
      isNewUser: false,
      companyInfoCompletedAt: new Date(),
      updatedAt: new Date(),
    };

    await userDocRef.set(saveData, { merge: true });

    logger.info(`[ACTION_USER] Företagsinformation sparad för användare ${userId}.`);
    return { success: true };

  } catch (error) {
    logger.error({ message: `[ACTION_USER] Fel vid uppdatering av företagsinfo för ${userId}`, error, formData });
    return { success: false, error: 'Ett serverfel inträffade.' };
  }
}

// Markerar att en användare har slutfört onboarding-processen.
export async function completeOnboarding(userId: string) {
  if (!userId) {
    logger.error('[ACTION_USER] completeOnboarding anropades utan userId.');
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.update({
      onboardingComplete: true, // Korrekt fältnamn
      isNewUser: false,
      onboardingCompletedAt: new Date(),
      updatedAt: new Date(),
    });
    logger.info(`[ACTION_USER] Onboarding slutförd för användare ${userId}.`);
    return { success: true };
  } catch (error) {
    logger.error({ message: `[ACTION_USER] Fel vid slutförande av onboarding för ${userId}`, error });
    return { success: false, error: 'Kunde inte slutföra onboarding-processen.' };
  }
}

// Markerar att en användare har slutfört den guidade turen.
export async function markTourAsCompleted(userId: string) {
  if (!userId) {
    logger.error('[ACTION_USER] markTourAsCompleted anropades utan userId.');
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.update({
      tourCompleted: true,
      tourCompletedAt: new Date(),
      updatedAt: new Date(),
    });
    logger.info(`[ACTION_USER] Guidad tur slutförd för användare ${userId}.`);
    return { success: true };
  } catch (error) {
    logger.error({ message: `[ACTION_USER] Fel vid markering av guidad tur för ${userId}`, error });
    return { success: false, error: 'Kunde inte markera guiden som slutförd.' };
  }
}
