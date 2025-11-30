
import 'server-only';
import { adminFirestore } from '../firebase'; // Korrekt relativ sökväg

// Definiera en typ för företagsuppgifter för bättre kodkvalitet
type CompanyData = {
  companyName?: string;
  logoUrl?: string;
};

const userCollection = adminFirestore.collection('users');

async function findOrCreate(uid: string, data: any) {
  const userRef = userCollection.doc(uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    await userRef.set(data);
    return data;
  }
  return userDoc.data();
}

async function getUserProfile(uid:string) {
    const userRef = userCollection.doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        return null;
    }
    return userDoc.data();
}

/**
 * Uppdaterar en användares profil med företagsuppgifter.
 * @param uid Användarens unika ID (från Firebase Auth).
 * @param companyData Ett objekt som innehåller companyName och/eller logoUrl.
 * @returns {Promise<void>}
 */
async function updateUserCompany(uid: string, companyData: CompanyData): Promise<void> {
  const userRef = userCollection.doc(uid);
  // Använder `update` för att bara ändra de angivna fälten och inte skriva över hela dokumentet.
  await userRef.update(companyData);
}

export { findOrCreate, getUserProfile, updateUserCompany };
