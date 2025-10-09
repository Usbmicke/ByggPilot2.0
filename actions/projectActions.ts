
'use server';

import { firestoreAdmin } from '@/lib/admin'; // Korrigerad import
import { FieldValue } from 'firebase-admin/firestore';
import { createFolder } from '@/services/driveService';
import { getNextProjectNumber } from '@/services/projectService';
import { revalidatePath } from 'next/cache';

interface ProjectData {
  name: string;
  address?: string;
  customerId: string;
  customerName: string;
}

// Hjälpfunktion för att skapa mappar och hantera fel
async function createAndGetFolderId(userId: string, name: string, parentId: string): Promise<string> {
    const folder = await createFolder(userId, name, parentId);
    if (!folder || !folder.id) {
        throw new Error(`Kunde inte skapa mappen: ${name}`);
    }
    return folder.id;
}

// Skapar ett aktivt projekt (Pågående)
export async function createActiveProject(data: ProjectData, userId: string) {
  if (!userId || !data.customerId) {
    return { success: false, error: 'Användar-ID och Kund-ID är obligatoriska.' };
  }

  const userDocRef = firestoreAdmin.collection('users').doc(userId);

  try {
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) throw new Error('Användaren hittades inte.');
    
    const userData = userDoc.data();
    const activeProjectsFolderId = userData?.googleDrive?.folderIds?.active;
    if (!activeProjectsFolderId) throw new Error('Kunde inte hitta målmappen för pågående projekt. Kör "Verifiera & Reparera Mappstruktur" från inställningar.');

    const projectNumber = await getNextProjectNumber(userId);
    const folderName = `${projectNumber}_${data.customerName} - ${data.name}`;
    
    const projectFolderId = await createAndGetFolderId(userId, folderName, activeProjectsFolderId);
    const subFolderNames = { avtal: '1_Avtal & Underlag', ekonomi: '2_Ekonomi', kma: '3_KMA', media: '4_Foton & Media' };
    const subFolderIds = {
        avtal: await createAndGetFolderId(userId, subFolderNames.avtal, projectFolderId),
        ekonomi: await createAndGetFolderId(userId, subFolderNames.ekonomi, projectFolderId),
        kma: await createAndGetFolderId(userId, subFolderNames.kma, projectFolderId),
        media: await createAndGetFolderId(userId, subFolderNames.media, projectFolderId),
    };

    const newProjectRef = userDocRef.collection('projects').doc();
    const newProject = {
      ...data,
      id: newProjectRef.id, projectNumber, status: 'Pågående',
      googleDrive: { folderId: projectFolderId, subFolderIds: subFolderIds },
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    };

    await newProjectRef.set(newProject);
    
    // Revalidera sökvägar där projektlistor visas
    revalidatePath('/');
    revalidatePath('/projects');
    
    console.log(`[Guldstandard] Aktivt projekt skapat: ${newProjectRef.id}.`);
    return { success: true, project: newProject };

  } catch (error) {
    console.error("Fel vid skapande av aktivt projekt:", error);
    const errorMessage = error instanceof Error ? error.message : 'Okänt serverfel.';
    return { success: false, error: errorMessage };
  }
}

// Skapar ett anbudsprojekt (prospekt)
export async function createProspectProject(data: ProjectData, userId: string) {
    if (!userId || !data.customerId) {
        return { success: false, error: 'Användar-ID och Kund-ID är obligatoriska.' };
    }

    const userDocRef = firestoreAdmin.collection('users').doc(userId);

    try {
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) throw new Error('Användaren hittades inte.');

        const userData = userDoc.data();
        const prospectsFolderId = userData?.googleDrive?.folderIds?.prospects;
        if (!prospectsFolderId) throw new Error('Kunde inte hitta målmappen för anbud. Kör "Verifiera & Reparera Mappstruktur" från inställningar.');

        const folderName = `${data.customerName} - ${data.name}`;
        const projectFolderId = await createAndGetFolderId(userId, folderName, prospectsFolderId);

        const newProjectRef = userDocRef.collection('projects').doc();
        const newProject = {
            ...data, id: newProjectRef.id, projectNumber: null, status: 'Anbud',
            googleDrive: { folderId: projectFolderId, subFolderIds: {} },
            createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
        };

        await newProjectRef.set(newProject);

        // Revalidera sökvägar där projektlistor visas
        revalidatePath('/');
        revalidatePath('/projects');

        console.log(`[Guldstandard] Anbudsprojekt skapat: ${newProjectRef.id}.`);
        return { success: true, project: newProject };

    } catch (error) {
        console.error("Fel vid skapande av anbudsprojekt:", error);
        const errorMessage = error instanceof Error ? error.message : 'Okänt serverfel.';
        return { success: false, error: errorMessage };
    }
}

// Hämtar alla projekt för en användare
export async function getProjects(userId: string) {
  if (!userId) {
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const projectsSnapshot = await firestoreAdmin
      .collection('users').doc(userId).collection('projects')
      .orderBy('createdAt', 'desc')
      .get();

    const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: projects };

  } catch (error) {
    console.error("Fel vid hämtning av projekt:", error);
    return { success: false, error: 'Kunde inte hämta projekt från servern.' };
  }
}
