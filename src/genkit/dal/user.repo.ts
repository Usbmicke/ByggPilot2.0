import 'server-only';
import { adminFirestore } from '@/genkit/firebase';

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

async function getUserProfile(uid: string) {
  const userRef = userCollection.doc(uid);
  const userDoc = await userRef.get();
  return userDoc.data();
}

export { findOrCreate, getUserProfile };
