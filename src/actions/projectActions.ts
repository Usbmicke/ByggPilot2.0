'use server';

import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { revalidatePath } from 'next/cache';
import { projectSchema, type ProjectFormData } from '@/lib/schemas/project';

/**
 * Skapar ett nytt projekt i Firestore-databasen.
 * Validerar indata med Zod och använder admin-SDK för säker server-side-operation.
 * @param {ProjectFormData} formData - Rådata från formuläret.
 * @returns {Promise<Object>} Ett objekt som indikerar framgång eller misslyckande.
 */
export const createProject = async (formData: ProjectFormData) => {
  // 1. Validera indata mot Zod-schemat
  const validatedFields = projectSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Valideringsfel. Kontrollera fälten och försök igen.',
    };
  }

  const { ...projectData } = validatedFields.data;

  try {
    // 2. Skapa ett nytt dokument i 'projects'-collectionen
    const projectRef = await firestoreAdmin.collection('projects').add({
        ...projectData,
        createdAt: new Date(), // Lägg till en tidsstämpel för skapandet
        updatedAt: new Date(), // Lägg till en tidsstämpel för uppdatering
    });

    console.log('Projekt skapat med ID:', projectRef.id);

    // 3. Invalidera cachen för projektsidan för att visa det nya projektet
    revalidatePath('/dashboard/projects');

    return {
      success: true,
      message: 'Projektet har skapats!',
      projectId: projectRef.id
    };

  } catch (error) {
    console.error('Fel vid skapande av projekt:', error);
    return {
      success: false,
      message: 'Databasfel: Kunde inte skapa projektet.',
    };
  }
};
