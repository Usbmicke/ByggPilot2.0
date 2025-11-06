import { z } from 'zod';
import { dal } from '@/lib/dal';
import { logger } from '@/lib/logger';

// =================================================================================
// AI VERKTYGSDEFINITIONER V2.2 - Anpassad för Vercel AI SDK 3.x
// =================================================================================
// Bytte namn på `parameters` till `inputSchema` för att matcha det nya API:et.

export const aiTools = {
  /**
   * Verktyg för att skapa ett nytt projekt.
   */
  createProject: {
    description: 'Använd detta verktyg för att skapa ett nytt byggprojekt. Fråga alltid efter kundens namn om det inte anges.',
    inputSchema: z.object({
      projectName: z.string().describe('Projektets unika och beskrivande namn, t.ex. "Renovering Alphyddan".'),
      clientName: z.string().describe('Namnet på kunden som beställt projektet, t.ex. "Brf Alphyddan".')
    }),
    generate: async ({ projectName, clientName }: { projectName: string; clientName: string }) => {
      try {
        logger.info(`[AI Tool:createProject] Attempting to create project: ${projectName}`);
        const projectId = await dal.projects.create({ projectName, clientName });
        logger.info(`[AI Tool:createProject] Successfully created project with ID: ${projectId}`);
        return { success: true, projectId, message: `Projektet '${projectName}' har skapats.` };
      } catch (error) {
        logger.error({ message: '[AI Tool:createProject] Failed to execute', error });
        return { success: false, message: 'Kunde inte skapa projektet på grund av ett internt fel.' };
      }
    }
  },

  /**
   * Verktyg för att lista aktiva projekt.
   */
  listProjects: {
    description: 'Använd detta verktyg för att lista alla nuvarande aktiva projekt.',
    inputSchema: z.object({}), // Inga parametrar behövs
    generate: async () => {
      try {
        logger.info('[AI Tool:listProjects] Attempting to list active projects.');
        const projects = await dal.projects.getActive();
        if (projects.length === 0) {
          return { success: true, message: 'Det finns för närvarande inga aktiva projekt.' };
        }
        // Formatera svaret så att AI:n lätt kan presentera det
        const projectList = projects.map((p: any) => `   - ${p.projectName} (Status: ${p.status})`).join('\n');
        return { success: true, message: `Här är en lista över aktiva projekt:\n${projectList}` };
      } catch (error) {
        logger.error({ message: '[AI Tool:listProjects] Failed to execute', error });
        return { success: false, message: 'Kunde inte hämta projektlistan på grund av ett internt fel.' };
      }
    }
  },

  // Fler verktyg (createCustomer, generateQuotePdf, etc.) kommer att läggas till här...
};
