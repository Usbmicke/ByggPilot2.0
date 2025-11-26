import { db } from "./admin";

export async function createUserProfile(uid: string, email: string) {
  const userRef = db.collection('users').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    // Skapa grundprofil + slumpat projektnummer-start
    await userRef.set({
      email,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
      projectPrefix: Math.floor(300 + Math.random() * 600), // t.ex. 352
      projectSequence: 100,
      role: 'admin' // Första användaren är admin
    });
    return { isNew: true };
  }
  return { isNew: false, data: doc.data() };
}

export async function setOnboardingComplete(uid: string) {
  await db.collection('users').doc(uid).update({
    onboardingCompleted: true,
    driveFolderCreated: true // Markera att vi gjort Drive-strukturen
  });
}