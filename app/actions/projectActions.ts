
'use server';

import { firestoreAdmin } from '@/app/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

interface ProjectData {
  name: string;
  address: string;
  customerId: string; // Varje projekt måste kopplas till en kund
  status: 'active' | 'completed' | 'paused';
  // userId för att veta vilken användare projektet tillhör
  userId: string;
}

// Funktion för att skapa ett nytt projekt
export async function createProject(data: Omit<ProjectData, 'userId'>, userId: string) {
  if (!userId || !data.customerId) {
    return { success: false, error: 'Användar-ID eller Kund-ID saknas.' };
  }

  try {
    const newProjectRef = firestoreAdmin.collection('projects').doc();
    await newProjectRef.set({
      ...data,
      id: newProjectRef.id,
      userId: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`Nytt projekt skapat med ID: ${newProjectRef.id} för användare ${userId}`);
    return { success: true, projectId: newProjectRef.id };
  } catch (error) {
    console.error("Fel vid skapande av projekt:", error);
    return { success: false, error: 'Kunde inte skapa projekt på servern.' };
  }
}

// Funktion för att hämta alla projekt för en specifik användare
export async function getProjects(userId: string) {
  if (!userId) {
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const projectsSnapshot = await firestoreAdmin
      .collection('projects')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const projects = projectsSnapshot.docs.map(doc => doc.data());
    return { success: true, data: projects };

  } catch (error) {
    console.error("Fel vid hämtning av projekt:", error);
    return { success: false, error: 'Kunde inte hämta projekt från servern.' };
  }
}
