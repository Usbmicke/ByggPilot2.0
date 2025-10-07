
'use server';

import { firestoreAdmin, admin } from '@/lib/firebase-admin';

// Det inkommande datainterfacet från formuläret
interface CompanyFormData {
  companyName: string;
  orgNumber: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
}

/**
 * Uppdaterar eller skapar en användares dokument med nästlad företagsinformation.
 * Denna åtgärd är den definitiva lösningen på buggen med företagsnamnet.
 */
export async function updateCompanyInfo(formData: CompanyFormData, userId: string) {
  if (!userId) {
    console.error('updateCompanyInfo anropades utan userId.');
    return { success: false, error: 'Användar-ID saknas. Sessionen kan ha gått ut.' };
  }

  try {
    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    
    // **KORRIGERINGEN:** Omvandla den platta formulärdatan till en nästlad struktur.
    const saveData = {
      company: {
        name: formData.companyName,
        orgNumber: formData.orgNumber,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        phone: formData.phone,
      },
      isNewUser: false, // Markera att användaren har slutfört detta steg
      companyInfoCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Använd .set() med { merge: true } för att säkert uppdatera eller skapa dokumentet.
    await userDocRef.set(saveData, { merge: true });

    console.log(`[ACTION SUCCESS] Företagsinformation sparad korrekt för användare ${userId}.`);
    return { success: true };

  } catch (error) {
    console.error(`[ACTION CRITICAL] Fel vid uppdatering av företagsinfo för ${userId}:`, error);
    return { success: false, error: 'Ett serverfel inträffade vid sparande av företagsinformation.' };
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

    if (docSnap.exists) { // Korrigerad från .exists() till .exists
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

/**
 * NY FUNKTION: Markerar användarens onboarding som slutförd.
 * Detta är det sista steget som anropas när användaren klickar på "Gå till Dashboard".
 */
export async function completeOnboarding(userId: string) {
  if (!userId) {
    console.error('completeOnboarding anropades utan userId.');
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    await userDocRef.update({
      onboardingCompleted: true,
      isNewUser: false, // Sista bekräftelsen på att användaren inte längre är ny
      onboardingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[ACTION SUCCESS] Onboarding markerad som slutförd för användare ${userId}.`);
    return { success: true };
  } catch (error) {
    console.error(`[ACTION CRITICAL] Fel vid slutförande av onboarding för ${userId}:`, error);
    return { success: false, error: 'Kunde inte slutföra onboarding-processen.' };
  }
}
