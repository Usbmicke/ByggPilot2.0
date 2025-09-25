
'use server';

import { firestoreAdmin, admin } from '@/app/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
    const companyDocRef = firestoreAdmin.collection('companies').doc(userId);
    await companyDocRef.set({
      ...companyData,
      userId: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Steg 2: Sätt en custom claim för användaren för att markera onboarding som klar
    const auth = admin.auth();
    await auth.setCustomUserClaims(userId, { onboardingComplete: true });
    
    // **NYTT STEG 3: Ta bort isNewUser-flaggan från användardokumentet**
    // Detta förhindrar att onboarding-modalen visas igen vid nästa inloggning.
    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    await userDocRef.update({
        isNewUser: false,
        updatedAt: FieldValue.serverTimestamp()
    });


    console.log(`Företagsinformation uppdaterad för användare ${userId}, onboarding-status satt och isNewUser-flagga borttagen.`);

    return { success: true };

  } catch (error) {
    console.error("Fel vid uppdatering av företagsinformation:", error);
    return { success: false, error: 'Kunde inte spara informationen på servern.' };
  }
}
