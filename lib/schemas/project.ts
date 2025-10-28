import { z } from 'zod';

export const projectSchema = z.object({
  projectName: z.string().min(3, "Projektnamnet måste vara minst 3 tecken långt."),
  customerId: z.string().min(1, "Du måste välja en kund."),
  projectType: z.enum(['ROT', 'FTG', 'Annat']),
  description: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const customerSchema = z.object({
  id: z.string().optional(), // ID är valfritt vid skapande
  name: z.string().min(1, "Kundnamn är obligatoriskt"),
  email: z.string().email("Ogiltig e-postadress").optional().or(z.literal('')),
  companyName: z.string().optional(),
});

export type Customer = z.infer<typeof customerSchema>;