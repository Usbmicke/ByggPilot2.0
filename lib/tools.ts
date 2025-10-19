
import { z } from 'zod';
import { tool } from 'ai';
import * as dal from './data-access'; 
import { ProjectStatus } from '@/types';

// =================================================================================
// VERKTYGS-BIBLIOTEK FÖR BYGGPILOT CO-PILOT (v2.0 - DAL-Driven)
// Guldstandard: Denna fil definierar AI:ns handlingsförmåga.
// Varje verktyg är en ren funktion som anropar Data Access Layer (DAL).
// Ingen direkt databasåtkomst är tillåten.
// =================================================================================

export const tools = {
  createProject: tool({
    description: 'Skapar ett nytt projekt. Fråga alltid efter kund och namn. Status sätts automatiskt till "Planerat".',
    parameters: z.object({
      name: z.string().describe('Namnet på det nya projektet.'),
      customerId: z.string().describe('ID för den befintliga kunden som projektet tillhör.'),
      customerName: z.string().describe('Namnet på kunden som projektet tillhör.'),
    }),
    execute: async ({ name, customerId, customerName }) => {
        // Anropa DAL för att skapa projektet.
        // DAL hanterar validering, databasskrivning och felhantering.
        const newProject = await dal.createProject('system-user', { // Hårdkodad userId tills sessionshantering är på plats
            name,
            customerId,
            customerName,
            status: ProjectStatus.PENDING,
        });

        // Returnera ett tydligt resultat. Eventuella fel har redan kastats av DAL.
        return { 
          success: true, 
          projectId: newProject.id,
          message: `Projektet "${name}" har skapats med status "Planerat".` 
        };
    },
  }),
  
  getCustomers: tool({
      description: 'Hämtar en lista på alla befintliga kunder i systemet. Använd detta för att hjälpa användaren att välja en kund när ett nytt projekt ska skapas.',
      parameters: z.object({}),
      execute: async () => {
          const customers = await dal.getCustomers('system-user'); // Hårdkodad userId
          if (customers.length === 0) {
              return {
                  success: true,
                  message: "Det finns inga kunder i systemet ännu.",
                  customers: [],
              }
          }
          return {
              success: true,
              message: `Hämtade ${customers.length} kunder.`,
              customers: customers.map(c => ({ id: c.id, name: c.name })),
          }
      }
  })
};
