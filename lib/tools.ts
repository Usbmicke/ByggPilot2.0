
import { z } from 'zod';
import { tool } from 'ai';
import * as dal from './data-access'; 
import { ProjectStatus } from '@/types';

// =================================================================================
// VERKTYGS-BIBLIOTEK FÖR BYGGPILOT CO-PILOT (v2.2 - Guldstandard)
// v2.2 Uppdatering: Lade till `getProjectDetails` för att hämta specifik projektdata.
// =================================================================================

export const tools = {
  getProjectDetails: tool({
    description: 'Hämtar detaljerad information om ett specifikt projekt. Använd detta när användaren frågar om ett visst projekt med dess ID.',
    parameters: z.object({
      projectId: z.string().describe('ID för projektet som ska hämtas.'),
    }),
    execute: async ({ projectId }) => {
      // DAL hanterar sessionsvalidering, databashämtning och felhantering.
      const project = await dal.getProjectForUser(projectId);

      if (!project) {
        return {
          success: false,
          message: `Kunde inte hitta något projekt med ID ${projectId}.`,
        };
      }

      return {
        success: true,
        message: `Hämtade detaljer för projektet "${project.name}".`,
        project: {
            id: project.id,
            name: project.name,
            status: project.status,
            customerName: project.customerName,
            totalInvoiced: project.totalInvoiced || 0,
            createdAt: project.createdAt,
        }
      };
    },
  }),

  createProject: tool({
    description: 'Skapar ett nytt projekt. Fråga alltid efter kund och namn. Status sätts automatiskt till "Ej påbörjat".',
    parameters: z.object({
      name: z.string().describe('Namnet på det nya projektet.'),
      customerId: z.string().describe('ID för den befintliga kunden som projektet tillhör.'),
      customerName: z.string().describe('Namnet på kunden som projektet tillhör.'),
    }),
    execute: async ({ name, customerId, customerName }) => {
        const newProject = await dal.createProject({ 
            name,
            customerId,
            customerName,
            status: ProjectStatus.NotStarted,
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
