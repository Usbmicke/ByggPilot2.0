import { firestoreAdmin } from '@/app/lib/firebase/firebaseAdmin';

// This file acts as a clean bridge.
// It imports the correctly initialized Firestore instance (`firestoreAdmin`)
// and re-exports it as `db`, which is the name the rest of the application
// (specifically the NextAuth Firestore adapter) expects.

const db = firestoreAdmin;

export { db };
