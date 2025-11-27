
import 'server-only';
import { firestore } from '@/lib/firebase/server';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
}

export const userRepo = {
  usersCollection: firestore.collection('users'),

  async get(uid: string): Promise<UserProfile | null> {
    const doc = await this.usersCollection.doc(uid).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as UserProfile;
  },

  async create(userData: Omit<UserProfile, 'createdAt' | 'onboardingCompleted'>): Promise<UserProfile> {
    const newUser: UserProfile = {
      ...userData,
      onboardingCompleted: false, // ALLTID false vid skapande
      createdAt: new Date(),
    };
    await this.usersCollection.doc(userData.uid).set(newUser);
    return newUser;
  },
  
  /**
   * NYCKELFUNKTION: Hittar en användare eller skapar en ny om den inte finns.
   * Detta är den enda funktionen som NextAuth-callbacken ska anropa.
   */
  async findOrCreate(uid: string, email: string): Promise<UserProfile> {
    const existingUser = await this.get(uid);
    if (existingUser) {
      return existingUser;
    }
    return this.create({ uid, email });
  },

  async update(uid: string, data: Partial<Omit<UserProfile, 'uid'>>): Promise<void> {
    await this.usersCollection.doc(uid).set(data, { merge: true });
  },
};
