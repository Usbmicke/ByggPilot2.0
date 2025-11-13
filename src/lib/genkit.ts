
'use client';

import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
// Importera den direkta app-instansen från den centrala konfigurationen
import { app } from '@/lib/config/firebase-client';

// Håll en singleton-instans av Firebase Functions
let functionsInstance: Functions | null = null;

const getFunctionsInstance = () => {
  if (typeof window === 'undefined') {
    // Detta ska aldrig hända eftersom filen är 'use client', men som en extra säkerhet.
    throw new Error('Firebase Functions kan bara initialiseras på klienten.');
  }
  if (!functionsInstance) {
    // Skapa instansen och associera den med vår centrala Firebase-app
    functionsInstance = getFunctions(app);
  }
  return functionsInstance;
};

/**
 * Anropar ett Genkit-flöde (som är deployat som en HTTPS Callable Function)
 * från klienten på ett säkert och autentiserat sätt.
 *
 * @param flowName Namnet på flödet som ska anropas (t.ex. 'getOrCreateUserAndCheckStatusFlow').
 * @param data Den data som ska skickas till flödet.
 * @returns En promise som resolverar med resultatet (output) från flödet.
 */
export async function callGenkitFlow<T>(flowName: string, data?: any): Promise<T> {
  console.log(`[Genkit] Förbereder anrop till HTTPS Callable Function: ${flowName}`);

  try {
    const functions = getFunctionsInstance();
    // Skapa en referens till den specifika funktionen (flödet)
    const callableFunction = httpsCallable(functions, flowName);

    console.log(`[Genkit] Anropar funktion med data:`, data);

    // Anropa funktionen och vänta på resultatet
    const result = await callableFunction(data);

    console.log(`[Genkit] Flöde ${flowName} slutfört, resultat:`, result.data);

    // Firebase Callable Functions returnerar data i ett `data`-objekt.
    return result.data as T;
    
  } catch (error) {
    console.error(`[Genkit] Fel vid anrop av Callable Function ${flowName}:`, error);
    // Kasta om felet så att den anropande koden kan hantera det.
    throw new Error(`Anrop till flöde ${flowName} misslyckades.`);
  }
}
