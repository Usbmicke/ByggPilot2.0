
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { gemini15Flash } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';
import { Message } from '../genkit'; // GULDSTANDARD: Importera från central plats

// =================================================================================
// MODELLER
// =================================================================================

const workhorse = gemini15Flash;

// =================================================================================
// FAS 4: DEN PRIMÄRA KONVERSATIONSHJÄRNAN (aibrain)
// =================================================================================

const aibrain = defineFlow(
  {
    name: 'aibrain',
    inputSchema: z.object({ messages: z.array(Message) }),
    outputSchema: z.object({ reply: z.string() }),
    authPolicy: (auth, input) => {
      if (!auth) throw new Error('Autentisering krävs.');
    },
  },
  async ({ messages }, context) => {
    console.log(`[aibrain] Startar flöde för användare ${context.auth?.uid}. Mottog ${messages.length} meddelanden.`);

    // Ta bort eventuella systemmeddelanden från historiken innan vi skickar till LLM
    const historyWithoutSystem = messages.filter(m => m.role !== 'system');

    const llmResponse = await generate({
      model: workhorse,
      history: historyWithoutSystem,
      prompt: 'Du är ByggPilot AI, en hjälpsam och vänlig AI-assistent för byggföretag i Sverige. Svara alltid på svenska. Var koncis och rakt på sak om inte användaren ber om detaljer.',
      config: { 
        temperature: 0.7,
      }
    });
    
    const reply = llmResponse.text();
    console.log(`[aibrain] Genererade svar: "${reply.substring(0, 100)}..."`);
    
    return { reply };
  }
);

// =================================================================================
// GAMLA FLÖDEN (ARKIVERADE)
// =================================================================================

// Dessa är nu arkiverade och bör integreras i `aibrain` i framtiden.

// ... (resten av den gamla koden kan tas bort eller behållas för referens)

// Exportera det enda, sanna flödet för chatten.
export { aibrain };
