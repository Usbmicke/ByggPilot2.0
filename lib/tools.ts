import { z } from 'zod';
import { tool } from 'ai';
import { adminDb } from './admin'; 
import logger from './logger';

// =================================================================================
// VERKTYGS-BIBLIOTEK FÖR BYGGPILOT CO-PILOT (v1.2 - SPÅRBARHET)
// FÖRÄNDRINGAR:
// 1.  **Funktions-export:** Exporterar nu en funktion som tar ett `traceId`.
// 2.  **Spårbar Exekvering:** `execute`-funktionen använder `traceId` för att skapa
//     en specifik logger, vilket gör varje verktygsanrop fullt spårbart.
// =================================================================================

export const toolDefinition = (traceId: string) => ({
  createProject: tool({
    description: 'Skapar ett nytt projekt i systemet.',
    parameters: z.object({
      name: z.string().describe('Namnet på det nya projektet.'),
      customerId: z.string().describe('ID för den befintliga kunden som projektet tillhör.'),
      budget: z.number().optional().describe('Projektets budget i kronor.'),
      timeline: z.string().optional().describe('En kort beskrivning av projektets tidslinje (t.ex. "Q4 2024").'),
    }),
    execute: async ({ name, customerId, budget, timeline }) => {
      const toolLogger = logger.child({ traceId, toolName: 'createProject' });

      try {
        toolLogger.info(
          { name, customerId, budget, timeline },
          'Påbörjar skapande av projekt i Firestore.'
        );

        const projectRef = await adminDb.collection('projects').add({
          name,
          customerId, 
          budget: budget || null,
          timeline: timeline || null,
          status: 'pending', 
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const projectId = projectRef.id;
        toolLogger.info({ projectId }, 'Projekt skapat framgångsrikt i Firestore.');

        return { 
          success: true, 
          projectId,
          message: `Projektet \'${name}\' har skapats med ID ${projectId}.` 
        };

      } catch (error) {
        toolLogger.error({ error, name, customerId }, 'Kritiskt fel vid skapande av projekt i Firestore.');
        return { success: false, message: `Kunde inte skapa projektet \'${name}\' på grund av ett databasfel.` };
      }
    },
  }),
});
