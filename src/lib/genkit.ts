
'use client';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase/client'; // Importera din Firebase app-instans

const functions = getFunctions(app, 'europe-west1');

/**
 * Anropar ett Genkit-flöde som är exponerat som en Firebase Function.
 * @param flowName Namnet på flödet att anropa (t.ex. 'audioToAtaFlow').
 * @param data Input-data till flödet.
 * @returns Svaret från flödet.
 */
export const callGenkitFlow = async <I, O>(flowName: string, data: I): Promise<O> => {
  console.log(`[callGenkitFlow] Anropar flöde: ${flowName} med data:`, data);
  try {
    const callable = httpsCallable(functions, flowName);
    const result = await callable({ data });
    console.log(`[callGenkitFlow] Svar från ${flowName}:`, result.data);
    return result.data as O;
  } catch (error) {
    console.error(`[callGenkitFlow] Fel vid anrop av flödet ${flowName}:`, error);
    // Kasta om felet så att den anropande komponenten kan hantera det
    throw new Error(`Anropet till ${flowName} misslyckades.`);
  }
};
