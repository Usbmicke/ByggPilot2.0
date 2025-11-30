
import 'server-only';
import { adminFirestore } from '../firebase'; // Korrekt relativ sökväg

// Definiera en typ för företagsuppgifter för bättre kodkvalitet
interface CompanyData {
  companyName: string;
  logoUrl?: string;
  driveRootFolderId?: string;
}

// Funktion för att uppdatera användarens företagsuppgifter
export async function updateUserCompany(uid: string, data: CompanyData): Promise<void> {
  const userRef = adminFirestore.collection('users').doc(uid);
  await userRef.set(data, { merge: true });
}

// Funktion för att hämta en användares profil
export async function getUserProfile(uid: string): Promise<CompanyData | null> {
  const userRef = adminFirestore.collection('users').doc(uid);
  const doc = await userRef.get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as CompanyData;
}

