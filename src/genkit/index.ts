import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase';

// Importera dina flows
import { onboardingFlow } from './flows/onboardingFlow';
import { chatFlow } from './flows/chatFlow';

configureGenkit({
  plugins: [
    googleAI(),
    firebase(), 
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Exportera flows så Genkit hittar dem
export { onboardingFlow, chatFlow };