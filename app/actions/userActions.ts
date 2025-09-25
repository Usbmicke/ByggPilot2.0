
'use server';

import { firestore } from '@/app/lib/firebase/firestore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/app/lib/firebase/admin';

interface CompanyData {
  companyName: string;
  orgNumber: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
}

/**
 * Sparar eller uppdaterar en användares företagsinformation och sätter en custom claim.
 */
export async function updateCompanyInfo(companyData: CompanyData, userId: string) {
  if (!userId) {
    throw new Error('Användar-ID saknas.');
  }

  try {
    // Steg 1: Spara företagsinformationen i Firestore
    const companyDocRef = doc(firestore, 'companies', userId);
    await setDoc(companyDocRef, {
      ...companyData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Steg 2: Sätt en custom claim för användaren för att markera onboarding som klar
    const auth = getAuth(adminApp);
    await auth.setCustomUserClaims(userId, { onboardingComplete: true });

    console.log(`Företagsinformation uppdaterad för användare ${userId} och onboarding-status satt.`);

    return { success: true };

  } catch (error) {
    console.error("Fel vid uppdatering av företagsinformation:", error);
    return { success: false, error: 'Kunde inte spara informationen på servern.' };
  }
}
