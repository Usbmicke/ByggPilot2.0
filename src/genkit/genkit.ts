
import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-ai';
import { firebase } from '@genkit-ai/firebase';

// Importera alla flöden här så att Genkit känner till dem.
// Detta är ett KRITISKT steg.
import './flows/onboarding';
import './flows/getProjectsFlow';
import './flows/getUserProfile';

export const genkit = configureGenkit({
  plugins: [
    // Initiera Firebase-plugin för att möjliggöra auth-policies.
    firebase(),
    // Initiera Google AI-plugin (om du använder Gemini-modeller, etc).
    googleAI(),
  ],
  // Aktivera loggning i utvecklingsmiljö för enklare felsökning.
  logLevel: 'debug',
  // Tillåt att flöden körs från klienten i utvecklingsmiljö.
  enableTracingAndMetrics: true,
});
