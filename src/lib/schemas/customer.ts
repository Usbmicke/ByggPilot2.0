
import { z } from 'zod';

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Kundnamn är obligatoriskt"),
  email: z.string().email("Ogiltig e-postadress").optional().or(z.literal('')),
  phone: z.string().optional(),
  
  // Adressfält, valfria
  address: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),

  // Företags-specifika fält
  companyName: z.string().optional(),
  customerType: z.enum(['Company', 'Private']),
});

export type Customer = z.infer<typeof customerSchema>;
