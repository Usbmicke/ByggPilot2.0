
'use server';

import { createAI, createStreamableValue, getMutableAIState } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { ReactNode } from 'react';
import { z } from 'zod';
import AtaForm from '@/components/forms/AtaForm';

// =================================================================================
// AI ACTION V1.0 - GULDSTANDARD
// BESKRIVNING: Denna fil definierar kärnan i AI-funktionaliteten. Den använder
// createAI för att sätta upp AI-kontexten. `submit` är huvud-action som anropas
// från klienten. Den använder OpenAIs `generateObject` med "Tool Use" för att
// förstå användarens avsikt och anropa rätt verktyg (t.ex. `createAta`).
// Zod används för strikt validering av indata. UI-komponenter (som AtaForm)
// streamas tillbaka till klienten för en dynamisk upplevelse.
// =================================================================================

// Definiera schemat för en ÄTA med Zod för validering
const ataSchema = z.object({
  projectName: z.string().describe('Namnet på projektet som ÄTA:n tillhör.'),
  description: z.string().describe('En kort beskrivning av ändringen, tillägget eller avgåendet.'),
  value: z.number().describe('Kostnaden eller värdet av ÄTA:n.'),
});

// Huvudfunktionen som anropas från klienten
async function submit(input: string): Promise<any> {
  'use server';
  const aiState = getMutableAIState<typeof AI>();
  const streamable = createStreamableValue();

  // Uppdatera AI-tillståndet med användarens meddelande
  aiState.update([
    ...aiState.get(),
    { role: 'user', content: input },
  ]);

  // Anropa OpenAI för att generera ett objekt baserat på användarens input och de verktyg vi har
  const { tool, ...rest } = await openai.generateObject({
    model: 'gpt-4-turbo-preview',
    prompt: input,
    schema: z.object({
        tool: z.enum(['createAta', 'createClient', 'createProject', 'startQuoteEngine']),
    }),
  });

  // Använd en switch för att anropa rätt verktyg
  switch (tool) {
    case 'createAta': {
        streamable.done(<AtaForm />);
        aiState.done([
            ...aiState.get(),
            { role: 'assistant', name: 'createAta', content: 'OK, här är ett formulär för att skapa en ny ÄTA.' },
        ]);
      break;
    }
    default: {
      // Om inget verktyg matchar, hantera det som en vanlig chattkonversation (framtida implementation)
      streamable.done('Jag förstår inte det kommandot än.');
       aiState.done([
            ...aiState.get(),
            { role: 'assistant', content: 'Jag förstår inte det kommandot än.' },
        ]);
    }
  }

  return streamable.value;
}

// Definiera det initiala AI-tillståndet och actions
const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  role: 'user' | 'assistant';
  display: ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submit,
  },
  initialUIState,
  initialAIState,
});
