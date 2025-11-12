
'use client';

import { getFunctions, httpsCallable } from 'firebase/functions';
// Uppdaterad importväg för att peka på den enda sanna källan
import { app } from '@/lib/config/firebase-client';

const functions = getFunctions(app, 'europe-west1');

/**
 * Anropar ett Genkit-flöde som är exponerat som en Firebase Function.
 * @param flowName Namnet på flödet att anropa.
 * @param data Input-data till flödet.
 * @returns Svaret från flödet.
 */
export const callGenkitFlow = async <I, O>(flowName: string, data: I): Promise<O> => {
  // Borttagna console.log för en renare konsol
  try {
    const callable = httpsCallable(functions, flowName);
    const result = await callable({ data });
    return result.data as O;
  } catch (error) {
    console.error(`[callGenkitFlow] Fel vid anrop av flödet ${flowName}:`, error);
    throw new Error(`Anropet till ${flowName} misslyckades.`);
  }
};
