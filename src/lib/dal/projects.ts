import { db } from "./admin";

export async function createProject(uid: string, name: string, address: string) {
  // Hämta användarens sekvensnummer
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  
  const projectNum = `${userData?.projectPrefix}-${userData?.projectSequence}`;
  
  // Skapa projektet
  await db.collection('projects').add({
    uid,
    projectNumber: projectNum,
    name,
    address,
    status: 'PLANNING',
    createdAt: new Date().toISOString()
  });

  // Öka sekvensen
  await userRef.update({
    projectSequence: (userData?.projectSequence || 100) + 1
  });

  return projectNum;
}