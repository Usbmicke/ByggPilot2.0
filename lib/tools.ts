
import { z } from 'zod';
import { tool } from 'ai';
import * as dal from './data-access'; 
import { ProjectStatus } from '@/types';

// =================================================================================
// VERKTYGS-BIBLIOTEK FÖR BYGGPILOT CO-PILOT (v2.1 - Guldstandard)
// Denna fil definierar AI:ns handlingsförmåga.
// Varje verktyg anropar Data Access Layer (DAL) och förlitar sig på DAL 
// för all databasinteraktion och sessionsvalidering.
// =================================================================================

export const tools = {
  createProject: tool({
    description: 'Skapar ett nytt projekt. Fråga alltid efter kund och namn. Status sätts automatiskt till "Ej påbörjat".',
    parameters: z.object({
      name: z.string().describe('Namnet på det nya projektet.'),
      customerId: z.string().describe('ID för den befintliga kunden som projektet tillhör.'),
      customerName: z.string().describe('Namnet på kunden som projektet tillhör.'),
    }),
    execute: async ({ name, customerId, customerName }) => {
        // DAL hanterar sessionsvalidering, databasskrivning och felhantering.
        const newProject = await dal.createProject({ 
            name,
            customerId,
            customerName,
            status: ProjectStatus.NotStarted, // Korrekt status enligt Guldstandard
        });

        return { 
          success: true, 
          projectId: newProject.id,
          message: `Projektet "${name}" har skapats med status "Ej påbörjat".` 
        };
    },
  }),
  
  getCustomers: tool({
      description: 'Hämtar en lista på alla befintliga kunder i systemet. Använd detta för att hjälpa användaren att välja en kund när ett nytt projekt ska skapas.',
      parameters: z.object({}),
      execute: async () => {
          // DAL hanterar sessionsvalidering.
          const customers = await dal.getCustomersForUser(); 
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
