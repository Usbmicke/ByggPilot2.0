
import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-ai';
import { firebase } from '@genkit-ai/firebase';

// Importera alla flöden här så att Genkit känner till dem.
// Detta är ett KRITISKT steg.
import './flows/onboardingFlow'; // Korrigerat importnamn
// Fler flödesimporter kan läggas till här

export default configureGenkit({
  plugins: [
    // Initiera Firebase-plugin för att möjliggöra auth-policies.
    firebase(),
    
    // Initiera Google AI-plugin med den angivna API-nyckeln.
    googleAI({
      apiKey: "AIzaSyCACnFr5ekLaynGy_ekQg_fwBWmyYp5z5Y",
    }),
  ],
  // Aktivera loggning i utvecklingsmiljö för enklare felsökning.
  logLevel: 'debug',
  // Tillåt att flöden körs från klienten i utvecklingsmiljö.
  enableTracingAndMetrics: true,
});
