
import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase'; // Behåller denna, då den kan innehålla andra konfigurationer
import { dotprompt, prompt } from '@genkit-ai/dotprompt';

// Importera alla flöden här så att Genkit känner till dem.
import './flows/onboardingFlow';
import './flows/getUserProfileFlow';
import './flows/createCompanyFolderFlow';

export default configureGenkit({
  plugins: [
    firebase(), // Använder den importerade funktionen
    googleAI(),
    dotprompt({}), // Använder den importerade funktionen
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
