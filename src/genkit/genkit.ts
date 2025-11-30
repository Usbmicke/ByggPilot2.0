
import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-genai'; // KORRIGERAT PAKETNAMN
import { firebase } from '@genkit-ai/firebase';
import { dotprompt } from '@genkit-ai/dotprompt';

// Importera alla flöden här så att Genkit känner till dem.
import './flows/onboardingFlow';
import './flows/getUserProfileFlow';
import './flows/createCompanyFolderFlow';

export default configureGenkit({
  plugins: [
    // Initiera Firebase-plugin för att möjliggöra auth-policies.
    firebase(),
    
    // Initiera Google AI-plugin (Gemini).
    // API-nyckeln hämtas automatiskt från GOOGLE_API_KEY miljövariabeln.
    googleAI(),

    // Initiera Dotprompt för att hantera prompts.
    dotprompt(),
  ],
  // Aktivera loggning i utvecklingsmiljö för enklare felsökning.
  logLevel: 'debug',
  // Tillåt att flöden körs från klienten i utvecklingsmiljö.
  enableTracingAndMetrics: true,
});
