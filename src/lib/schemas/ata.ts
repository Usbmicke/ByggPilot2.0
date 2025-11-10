
import { z } from 'zod';

export const ataStatusSchema = z.enum(['Pending', 'Approved', 'Rejected']);

export const ataSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string().optional(),
  status: ataStatusSchema,
  // Lägg till andra fält som kan behövas, t.ex.:
  // projectId: z.string(),
  // createdDate: z.date(), 
  // cost: z.number(),
});

export type Ata = z.infer<typeof ataSchema>;
export type AtaStatus = z.infer<typeof ataStatusSchema>;
