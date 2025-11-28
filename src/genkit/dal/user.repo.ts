
import 'server-only';
import { firestore } from '@/lib/firebase/server';

// Byt ut Interface mot en mer flexibel Type för partiella uppdateringar
export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
};

export const userRepo = {
  usersCollection: firestore.collection('users'),

  async get(uid: string): Promise<UserProfile | null> {
    const doc = await this.usersCollection.doc(uid).get();
    if (!doc.exists) {
      return null;
    }
    // Säker typning med Firestore-konverterare skulle vara ännu bättre, men detta är OK.
    return doc.data() as UserProfile;
  },

  /**
   * Den ENDA metoden för att skapa en användare.
   * Skapar en ny användare med onboardingCompleted satt till false.
   * Om användaren redan finns, returneras den befintliga profilen.
   */
  async findOrCreate(uid: string, email: string): Promise<UserProfile> {
    const existingUser = await this.get(uid);
    if (existingUser) {
      return existingUser;
    }

    const newUserProfile: UserProfile = {
      uid,
      email,
      onboardingCompleted: false, // Onboarding är inte slutförd vid skapande
      createdAt: new Date(),
    };

    await this.usersCollection.doc(uid).set(newUserProfile);
    return newUserProfile;
  },

  /**
   * Uppdaterar en befintlig användarprofil.
   * Använder partiell typning för att tillåta uppdatering av valfria fält.
   * Förhindrar ändring av 'uid' och 'createdAt'.
   */
  async update(uid: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>): Promise<void> {
    await this.usersCollection.doc(uid).set(data, { merge: true });
  },
};
