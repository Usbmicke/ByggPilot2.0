
import { z } from 'zod';

// Definierar de olika typerna av händelser som kan inträffa
export const eventTypeSchema = z.enum([
  'new_task',
  'invoice_due',
  'project_approved',
  'new_message',
  'log',
  'Tip', // Används för proaktiva tips från systemet
]);

// Huvudschema för en "actionable event"
export const actionableEventSchema = z.object({
  id: z.string(),
  type: eventTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  message: z.string().optional(), // Alternativ till description
  createdAt: z.date(), // Använder Zod's datumtyp för typsäkerhet
  isRead: z.boolean().default(false),
  link: z.string().optional(), // Länk för att navigera till relevant sida
});

// Exportera TypeScript-typer
export type ActionableEvent = z.infer<typeof actionableEventSchema>;
export type EventType = z.infer<typeof eventTypeSchema>;
