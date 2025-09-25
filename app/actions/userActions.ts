
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
 * Sparar eller uppdaterar en användares företagsinformation och markerar onboarding som klar.
 */
export async function updateCompanyInfo(companyData: CompanyData, userId: string) {
  if (!userId) {
    throw new Error('Användar-ID saknas.');
  }

  try {
    const companyDocRef = firestoreAdmin.collection('companies').doc(userId);
    await companyDocRef.set({
      ...companyData,
      userId: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    await userDocRef.update({
        isNewUser: false, // Markera onboarding som slutförd
        updatedAt: FieldValue.serverTimestamp()
    });

    console.log(`Företagsinformation uppdaterad och onboarding slutförd för ${userId}.`);

    return { success: true };

  } catch (error) {
    console.error("Fel vid uppdatering av företagsinformation:", error);
    return { success: false, error: 'Kunde inte spara informationen på servern.' };
  }
}

/**
 * Hämtar en specifik användares data från Firestore.
 * @param userId Användarens unika ID (samma som dokument-ID i Firestore).
 * @returns Användardataobjektet eller null om det inte hittas.
 */
export async function getUserData(userId: string) {
  if (!userId) {
    console.error('getUserData anropades utan userId.');
    return null;
  }

  try {
    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    const docSnap = await userDocRef.get();

    if (docSnap.exists()) {
      return docSnap.data() as { isNewUser?: boolean; [key: string]: any; };
    } else {
      console.warn(`Ingen användare med ID ${userId} hittades i databasen.`);
      return null;
    }
  } catch (error) {
    console.error(`Fel vid hämtning av användardata för ${userId}:`, error);
    return null; // Returnerar null vid fel för att undvika att appen kraschar.
  }
}
