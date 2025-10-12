
'use server';

import { adminDb, admin } from '@/lib/admin';

interface CompanyFormData {
  companyName: string;
  orgNumber: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
}

export async function updateCompanyInfo(formData: CompanyFormData, userId: string) {
  if (!userId) {
    console.error('updateCompanyInfo anropades utan userId.');
    return { success: false, error: 'Användar-ID saknas. Sessionen kan ha gått ut.' };
  }

  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    
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
      companyInfoCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userDocRef.set(saveData, { merge: true });

    console.log(`[ACTION SUCCESS] Företagsinformation sparad korrekt för användare ${userId}.`);
    return { success: true };

  } catch (error) {
    console.error(`[ACTION CRITICAL] Fel vid uppdatering av företagsinfo för ${userId}:`, error);
    return { success: false, error: 'Ett serverfel inträffade vid sparande av företagsinformation.' };
  }
}

export async function getUserData(userId: string) {
  if (!userId) {
    console.error('getUserData anropades utan userId.');
    return null;
  }

  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
      return docSnap.data() as { isNewUser?: boolean; tourCompleted?: boolean; onboardingComplete?: boolean; [key: string]: any; };
    } else {
      console.warn(`Ingen användare med ID ${userId} hittades i databasen.`);
      return null;
    }
  } catch (error) {
    console.error(`Fel vid hämtning av användardata för ${userId}:`, error);
    return null; 
  }
}

export async function updateUserTermsStatus(userId: string, accepted: boolean) {
  if (!userId) {
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.set({
      termsAccepted: accepted,
      termsAcceptedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error(`[CRITICAL] Fel vid uppdatering av villkors-status för användare ${userId}:`, error);
    return { success: false, error: 'Kunde inte uppdatera status för villkor.' };
  }
}

export async function completeOnboarding(userId: string) {
  if (!userId) {
    console.error('completeOnboarding anropades utan userId.');
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.update({
      onboardingCompleted: true,
      isNewUser: false,
      onboardingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[ACTION SUCCESS] Onboarding markerad som slutförd för användare ${userId}.`);
    return { success: true };
  } catch (error) {
    console.error(`[ACTION CRITICAL] Fel vid slutförande av onboarding för ${userId}:`, error);
    return { success: false, error: 'Kunde inte slutföra onboarding-processen.' };
  }
}

/**
 * GULDSTANDARD-IMPLEMENTERING: Markerar den guidade turen som slutförd.
 */
export async function markTourAsCompleted(userId: string) {
  if (!userId) {
    console.error('markTourAsCompleted anropades utan userId.');
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.update({
      tourCompleted: true,
      tourCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[ACTION SUCCESS] Guidad tur markerad som slutförd för användare ${userId}.`);
    return { success: true };
  } catch (error) {
    console.error(`[ACTION CRITICAL] Fel vid markering av guidad tur för ${userId}:`, error);
    return { success: false, error: 'Kunde inte markera guiden som slutförd.' };
  }
}
