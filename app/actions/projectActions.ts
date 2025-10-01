
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/services/firestoreService'; // GULDSTANDARD: Korrekt, centraliserad DB-instans
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

// GULDSTANDARD: Interface uppdaterat för att exkludera userId, då det hanteras internt.
interface ProjectData {
  name: string;
  address: string;
  customerId: string; 
  status: 'active' | 'completed' | 'paused';
}

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.uid) {
    throw new Error('Användaren är inte autentiserad eller så saknas UID.');
  }
  return session.user.uid;
}

// GULDSTANDARD: Funktionen accepterar inte längre ett osäkert, externt userId.
export async function createProject(data: ProjectData) {
  const userId = await getUserId(); // Säkrar userId internt.

  if (!data.customerId) {
    return { success: false, error: 'Kund-ID saknas.' };
  }

  try {
    const projectsCollectionRef = collection(db, 'users', userId, 'projects');
    const newProjectRef = await addDoc(projectsCollectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    
    console.log(`Nytt projekt skapat med ID: ${newProjectRef.id} för användare ${userId}`);
    return { success: true, projectId: newProjectRef.id };
  } catch (error) {
    console.error("Fel vid skapande av projekt:", error);
    return { success: false, error: 'Kunde inte skapa projekt på servern.' };
  }
}

// GULDSTANDARD: Funktionen accepterar inte längre ett osäkert, externt userId.
export async function getProjects() {
  const userId = await getUserId(); // Säkrar userId internt.

  try {
    const projectsCollectionRef = collection(db, 'users', userId, 'projects');
    const q = query(projectsCollectionRef, where("userId", "==", userId)); // Dubbelkoll för säkerhet
    const querySnapshot = await getDocs(q);

    const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: projects };

  } catch (error) {
    console.error("Fel vid hämtning av projekt:", error);
    return { success: false, error: 'Kunde inte hämta projekt från servern.' };
  }
}
