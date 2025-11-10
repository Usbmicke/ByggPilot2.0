
import { z } from 'zod';
import { customerSchema } from './customer'; // Importera kundschemat om det behövs för att kapsla

// Schema för en enskild fakturarad
export const invoiceLineSchema = z.object({
  id: z.string().optional(), // ID kan vara valfritt om det är en ny rad
  description: z.string().min(1, "Beskrivning får inte vara tom"),
  quantity: z.number().min(0, "Kvantitet måste vara ett positivt tal"),
  unit: z.string().min(1, "Enhet får inte vara tom"),
  unitPrice: z.number().min(0, "Pris måste vara ett positivt tal"),
});

// Schema för ROT-avdrag
export const rotDeductionSchema = z.object({
  isApplicable: z.boolean(),
  personNumber: z.string().optional(),
  laborCost: z.number().optional(),
  amount: z.number().optional(),
});

// Huvudschema för en faktura
export const invoiceSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  customer: customerSchema, // Kapsla kundinformation
  invoiceLines: z.array(invoiceLineSchema),
  issueDate: z.date(),
  dueDate: z.date(),
  rotDeduction: rotDeductionSchema.optional(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']).default('Draft'),
  // ... andra fält som totalbelopp etc. kan läggas till här
});

// Schema specifikt för att *skapa* en faktura (utan ID, status etc.)
export const invoiceCreationSchema = invoiceSchema.omit({ 
    id: true, 
    status: true 
});


// Exportera TypeScript-typer
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceLine = z.infer<typeof invoiceLineSchema>;
export type RotDeduction = z.infer<typeof rotDeductionSchema>;
export type InvoiceCreationData = z.infer<typeof invoiceCreationSchema>;

