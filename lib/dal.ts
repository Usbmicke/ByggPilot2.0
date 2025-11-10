
// =================================================================================
// DATA ACCESS LAYER (DAL) - V4 ARKITEKTUR (KORRIGERAD)
// =================================================================================

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
// KORRIGERING: Importera den korrekta 'Auth'-typen från rätt paket.
import { type Auth } from '@genkit-ai/firebase'; 

// Importera de centraliserade schemana
import { UserSchema, OnboardingDataSchema, User, OnboardingData } from './schemas';

if (!getApps().length) { initializeApp(); }
const db = getFirestore();

/**
 * Hämtar eller skapar en användare.
 */
export async function getOrCreateUser(auth: Auth): Promise<User> {
  // Flödet som anropar denna funktion validerar att auth-objektet finns.
  const userRef = db.collection('users').doc(auth.uid);
  const userSnapshot = await userRef.get();

  if (userSnapshot.exists()) {
    return UserSchema.parse(userSnapshot.data());
  } else {
    const newUser: Partial<User> = { 
      userId: auth.uid,
      email: auth.token?.email,
      onboardingComplete: false,
      createdAt: FieldValue.serverTimestamp(),
    };
    await userRef.set(newUser);
    // Hämta igen för att få en fullständig, validerad User-objekt
    const docAfterWrite = await userRef.get();
    return UserSchema.parse(docAfterWrite.data());
  }
}

/**
 * Sparar den fullständiga onboardning-datan och sätter användarens status till slutförd.
 */
export async function completeOnboarding(auth: Auth, onboardingData: OnboardingData): Promise<User> {
    // Flödet som anropar denna funktion validerar att auth-objektet finns.
    const validatedData = OnboardingDataSchema.parse(onboardingData);
    const userRef = db.collection('users').doc(auth.uid);
    
    const updateData = {
        onboardingComplete: true,
        company: {
            name: validatedData.companyName,
            orgNumber: validatedData.orgNumber,
            address: validatedData.address,
            logoUrl: validatedData.logoUrl,
        },
        settings: {
            defaultHourlyRate: validatedData.defaultHourlyRate,
            defaultMaterialMarkup: validatedData.defaultMaterialMarkup,
        }
    };

    await userRef.update(updateData);
    
    const updatedUserDoc = await userRef.get();
    return UserSchema.parse(updatedUserDoc.data());
}

/**
 * Skapar ett demoprojekt för en specifik användare.
 */
export async function createDemoProject(auth: Auth): Promise<any> {
    // Flödet som anropar denna funktion validerar att auth-objektet finns.
    const projectRef = db.collection('projects').doc(); 
    
    const demoProject = {
        projectId: projectRef.id,
        userId: auth.uid, 
        name: "Renovering Villa Björkhagen (Demo)",
        createdAt: FieldValue.serverTimestamp(),
    };

    await projectRef.set(demoProject);
    return demoProject;
}
