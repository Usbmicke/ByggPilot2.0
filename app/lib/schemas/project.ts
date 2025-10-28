
import * as z from 'zod';

export const projectSchema = z.object({
  projectName: z.string().min(3, "Projektnamnet måste vara minst 3 tecken långt."),
  customerId: z.string().min(1, "Du måste välja en kund."),
  projectType: z.enum(['ROT', 'FTG', 'Annat']),
  description: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
