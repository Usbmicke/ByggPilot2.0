
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/services/firestoreService';
import { collection, addDoc, getDocs, query, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createProjectFolderStructure } from './driveActions'; // Importera den Guldstandard-kompatibla Drive-åtgärden
import { Project } from '@/app/types/project';

/**
 * GULDSTANDARD ACTION: `createProject`
 * Skapar ett nytt projekt, inklusive mappstruktur i Google Drive.
 * Processen är transaktionsliknande: om ett steg misslyckas, rullas tidigare steg tillbaka.
 */
export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'driveFolderId'>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.uid) {
    return { success: false, error: 'Autentisering krävs.' };
  }
  const userId = session.user.uid;

  let projectId: string | null = null;

  try {
    // Steg 1: Validera indata
    if (!projectData.name || !projectData.customerId) {
      return { success: false, error: 'Projektnamn och kund-ID är obligatoriska.' };
    }

    // Steg 2: Skapa projekt-dokumentet i Firestore för att få ett ID
    const projectsCollectionRef = collection(db, 'users', userId, 'projects');
    const newProjectDocRef = await addDoc(projectsCollectionRef, {
      ...projectData,
      userId: userId,
      status: projectData.status || 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      driveFolderId: null, // Initialt null
    });
    projectId = newProjectDocRef.id;

    // Steg 3: Skapa mappstruktur i Google Drive
    // Notera: `createProjectFolderStructure` måste kunna hantera fel och returnera ett tydligt resultat.
    const driveResult = await createProjectFolderStructure(projectData.name);
    
    if (!driveResult.success || !driveResult.folderId) {
      // Om Drive-steget misslyckas, radera det skapade Firestore-dokumentet
      throw new Error(driveResult.error || 'Kunde inte skapa mappstruktur i Google Drive.');
    }

    // Steg 4: Uppdatera Firestore-dokumentet med driveFolderId
    const projectDoc = doc(db, 'users', userId, 'projects', projectId);
    await updateDoc(projectDoc, {
      driveFolderId: driveResult.folderId,
      updatedAt: serverTimestamp(),
    });

    console.log(`Projekt ${projectId} och Drive-mapp ${driveResult.folderId} skapades för användare ${userId}`);
    return { success: true, projectId: projectId, driveFolderId: driveResult.folderId };

  } catch (error) {
    console.error("Fel vid skapande av projekt:", error);
    // Cleanup: Om ett fel inträffade efter att projekt-dokumentet skapades, ta bort det.
    if (projectId) {
      await deleteDoc(doc(db, 'users', userId, 'projects', projectId));
      console.log(`Raderade ofullständigt projekt ${projectId} efter fel.`);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Ett okänt serverfel uppstod.';
    return { success: false, error: errorMessage };
  }
}

/**
 * GULDSTANDARD ACTION: `getProjects`
 * Hämtar alla projekt för den autentiserade användaren.
 */
export async function getProjects() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.uid) {
    return { success: false, error: 'Autentisering krävs.' };
  }
  const userId = session.user.uid;

  try {
    const projectsCollectionRef = collection(db, 'users', userId, 'projects');
    const q = query(projectsCollectionRef); // Ingen 'where'-sats behövs, sökvägen är säker
    const querySnapshot = await getDocs(q);

    const projects = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Project[];

    return { success: true, data: projects };

  } catch (error) {
    console.error('Fel vid hämtning av projekt:', error);
    return { success: false, error: 'Ett serverfel uppstod vid hämtning av projekt.' };
  }
}
