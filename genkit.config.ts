import { genkit } from '@genkit-ai/flow';
import { googleGenai } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase';

export default genkit({
  plugins: [
    firebase(),
    googleGenai(),
  ],
  source: 'src/genkit',
  logLevel: 'debug',
  enableTracing: true,
});
