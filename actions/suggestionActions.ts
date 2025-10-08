
'use server';

import { firestoreAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

/**
 * Server Action för att hämta alla nya, föreslagna åtgärder.
 */
export async function getSuggestedActions(userId: string) {
  if (!userId) {
    return { success: false, error: 'Användar-ID är obligatoriskt.' };
  }

  try {
    const actionsSnapshot = await firestoreAdmin
      .collection('users').doc(userId).collection('actions')
      .where('status', '==', 'new')
      .orderBy('createdAt', 'desc')
      .get();

    if (actionsSnapshot.empty) {
      return { success: true, data: [] };
    }

    const actions = actionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: actions };

  } catch (error) {
    console.error(`[SA] Fel vid hämtning av åtgärder för ${userId}:`, error);
    return { success: false, error: 'Kunde inte hämta föreslagna åtgärder.' };
  }
}

/**
 * Server Action för att uppdatera statusen på en åtgärd.
 */
export async function updateActionStatus(userId: string, actionId: string, newStatus: 'ignored' | 'archived' | 'done') {
   if (!userId || !actionId || !newStatus) {
    return { success: false, error: 'Användar-ID, Åtgärds-ID och ny status krävs.' };
  }

  try {
    const actionRef = firestoreAdmin.collection('users').doc(userId).collection('actions').doc(actionId);

    const doc = await actionRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Åtgärden hittades inte.' };
    }

    await actionRef.update({ status: newStatus });

    // Invalidera cachen för dashboard-sidan så att förslagen uppdateras
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error(`[SA] Fel vid uppdatering av åtgärd ${actionId} för ${userId}:`, error);
    return { success: false, error: 'Kunde inte uppdatera åtgärdens status.' };
  }
}
