/**
 * @fileoverview Klient-sida för att interagera med Genkit-flöden.
 * Denna fil hanterar anrop till Firebase Functions som exponerar Genkit-flöden.
 */
'use client';

import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
// KORRIGERAD SÖKVÄG: Importera den centrala, klient-säkra app-instansen.
import { app } from '@/app/_lib/config/firebase-client';

// Håll en singleton-instans av Firebase Functions
let functionsInstance: Functions | null = null;

function getFunctionsInstance(): Functions {
  if (typeof window === 'undefined') {
    // Detta ska aldrig hända eftersom filen är 'use client', men som en extra säkerhet.
    throw new Error('Firebase Functions kan bara initialiseras på klienten.');
  }
  if (!functionsInstance) {
    // Skapa instansen och associera den med vår centrala Firebase-app
    functionsInstance = getFunctions(app);
  }
  return functionsInstance;
}

/**
 * En generisk funktion för att anropa ett Genkit-flöde via en Firebase Function.
 *
 * @template I Input-datatyp för flödet.
 * @template O Output-datatyp från flödet.
 * @param {string} flowName Namnet på det Genkit-flöde som ska anropas.
 *                          Detta måste matcha namnet på den exporterade funktionen i Firebase.
 * @param {I} payload Datan som ska skickas till flödet.
 * @returns {Promise<O>} En promise som resolverar med resultatet från flödet.
 */
export async function callGenkitFlow<I, O>(flowName: string, payload: I): Promise<O> {
  try {
    const functions = getFunctionsInstance();
    const callable = httpsCallable<I, { data: O }>(functions, flowName);
    const result = await callable(payload);
    
    // Firebase Callable Functions returnerar data i ett `data`-objekt.
    // Vi packar upp det för att göra API:et renare för våra komponenter.
    return result.data.data;

  } catch (error) {
    console.error(`[Genkit Error] Anrop till flödet "${flowName}" misslyckades:`, error);
    // Kasta om felet så att den anropande komponenten kan hantera det (t.ex. visa ett felmeddelande).
    throw error;
  }
}
