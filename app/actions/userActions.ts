
'use server';

import { firestoreAdmin, admin } from '@/app/lib/firebase-admin';

interface CompanyData {
  companyName: string;
  orgNumber: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
}

/**
 * Uppdaterar eller skapar en användares dokument med företagsinformation och markerar onboarding som klar.
 * Denna version använder .set({ merge: true }) för att vara robust och felsäker.
 */
export async function updateCompanyInfo(companyData: CompanyData, userId: string) {
  if (!userId) {
    console.error('updateCompanyInfo anropades utan userId.');
    return { success: false, error: 'Användar-ID saknas. Sessionen kan ha gått ut.' };
  }

  try {
    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    
    // Förbered all data som ska sparas
    const saveData = {
      ...companyData, // Sprid ut all företagsinformation
      isNewUser: false, // Markera onboarding som slutförd
      companyInfoCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Använd .set() med { merge: true } för att antingen skapa dokumentet om det saknas,
    // eller slå samman datan om det redan existerar. Detta löser "No document to update"-felet.
    await userDocRef.set(saveData, { merge: true });

    console.log(`Företagsinformation och onboarding slutförd för användare ${userId}.`);
    return { success: true };

  } catch (error) {
    console.error(`[CRITICAL] Fel vid uppdatering av företagsinformation för användare ${userId}:`, error);
    return { success: false, error: 'Ett serverfel inträffade. Informationen kunde inte sparas.' };
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
    return null; 
  }
}

/**
 * Uppdaterar status för användarvillkoren för en specifik användare.
 * @param userId Användarens ID.
 * @param accepted Om användaren har accepterat villkoren.
 * @returns Ett resultatobjekt.
 */
export async function updateUserTermsStatus(userId: string, accepted: boolean) {
  if (!userId) {
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const userDocRef = firestoreAdmin.collection('users').doc(userId);
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
