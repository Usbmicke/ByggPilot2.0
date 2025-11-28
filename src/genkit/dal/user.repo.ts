
import 'server-only';
import { firestore } from '../firebase';
import { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, Firestore } from 'firebase-admin/firestore';

// ===================================================================
// User Profile Data Model
// ===================================================================

export interface UserProfile {
  uid: string;                 // Firebase Auth UID
  email: string;               // User's email
  displayName?: string;        // User's display name
  onboardingCompleted: boolean;  // Flag for onboarding status
  createdAt: Date;             // Timestamp of creation
}

// ===================================================================
// Firestore Converter
// ===================================================================
// Gold Standard: Använd en Firestore-konverterare för att garantera
// att data som läses från och skrivs till Firestore alltid matchar
// UserProfile-interfacet. Detta förhindrar typfel vid körning.
// ===================================================================

const userProfileConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore(user: UserProfile): DocumentData {
    return {
      ...user,
      createdAt: user.createdAt, // Behåll som Date-objekt i Firestore
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): UserProfile {
    const data = snapshot.data();
    return {
      uid: snapshot.id,
      email: data.email,
      displayName: data.displayName,
      onboardingCompleted: data.onboardingCompleted,
      // Korrekt hantering av Timestamps från Firestore
      createdAt: data.createdAt.toDate(),
    };
  },
};

// ===================================================================
// User Repository
// ===================================================================
// Ett centraliserat repository för all interaktion med 'users'-c
// samlingen i Firestore. All databaslogik relaterad till användare
// ska finnas här.
// ===================================================================

class UserRepository {
  private readonly collection;

  constructor(db: Firestore) {
    this.collection = db.collection('users').withConverter(userProfileConverter);
  }

  /**
   * Hämtar en enskild användarprofil baserat på UID.
   * @param uid Användarens unika Firebase UID.
   * @returns {Promise<UserProfile | null>} Användarprofilen eller null om den inte finns.
   */
  async get(uid: string): Promise<UserProfile | null> {
    const docSnap = await this.collection.doc(uid).get();
    return docSnap.exists ? docSnap.data() : null;
  }

  /**
   * Skapar en ny användarprofil eller hämtar den befintliga.
   * @param uid Firebase UID.
   * @param email Användarens e-post.
   * @returns {Promise<UserProfile>} Den skapade eller befintliga profilen.
   */
  async findOrCreate(uid: string, email: string): Promise<UserProfile> {
    const existingUser = await this.get(uid);
    if (existingUser) {
      return existingUser;
    }

    const newUser: UserProfile = {
      uid,
      email,
      onboardingCompleted: false,
      createdAt: new Date(),
    };
    await this.collection.doc(uid).set(newUser);
    return newUser;
  }

  /**
   * Uppdaterar en befintlig användarprofil.
   * @param uid Användarens UID.
   * @param data Partiella data att uppdatera.
   */
  async update(uid: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>): Promise<void> {
    await this.collection.doc(uid).set(data, { merge: true });
  }
}

// Exportera en singleton-instans av repositoryt för att användas av flöden.
export const userRepo = new UserRepository(firestore);
