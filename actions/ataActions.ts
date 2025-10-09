
'use server';

import { adminDb } from '@/lib/admin';
import { FieldValue } from 'firebase-admin/firestore';

interface AtaData {
  title?: string;
  notes?: string;
  projectId: string;
}

export async function createAta(data: AtaData, userId: string) {
  const { projectId, title, notes } = data;

  if (!userId || !projectId) {
    return { success: false, error: 'Användar-ID och Projekt-ID är obligatoriska.' };
  }
  
  if (!title && !notes) {
      return { success: false, error: 'En titel eller anteckning krävs för att skapa ett ÄTA-underlag.' };
  }

  const projectRef = adminDb.collection('users').doc(userId).collection('projects').doc(projectId);

  try {
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
        return { success: false, error: 'Det angivna projektet kunde inte hittas.' };
    }

    const newAtaRef = projectRef.collection('atas').doc();
    
    const newAta = {
      id: newAtaRef.id,
      projectId,
      title: title || 'Namnlöst ÄTA',
      notes: notes || '',
      status: 'Utkast',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await newAtaRef.set(newAta);
    
    console.log(`[Guldstandard] Nytt ÄTA-utkast skapat: ${newAtaRef.id} för projekt ${projectId}`);
    return { success: true, ata: newAta };

  } catch (error) {
    console.error("Fel vid skapande av ÄTA:", error);
    const errorMessage = error instanceof Error ? error.message : 'Okänt serverfel vid skapande av ÄTA.';
    return { success: false, error: errorMessage };
  }
}
