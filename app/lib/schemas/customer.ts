
import { z } from 'zod';

// =====================================================================================
// KUND-SCHEMA (ZOD)
// Garanterar dataintegritet vid skapande och uppdatering av kunder.
// =====================================================================================

export const customerSchema = z.object({
  customerType: z.enum(['Company', 'PrivatePerson']),
  email: z.string().email({ message: "Ogiltig e-postadress." }),
  phone: z.string().optional(),
  
  // Fält specifika för Företagskunder
  companyName: z.string().optional(),
  orgNumber: z.string().optional(),
  referencePerson: z.string().optional(),

  // Fält specifika för Privatkunder
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine(data => {
  if (data.customerType === 'Company' && !data.companyName) {
    return false; // Företagsnamn är obligatoriskt för företagskunder
  }
  if (data.customerType === 'PrivatePerson' && (!data.firstName || !data.lastName)) {
    return false; // För- och efternamn är obligatoriskt för privatkunder
  }
  return true;
}, {
  // Anpassat felmeddelande om valideringen ovan misslyckas
  message: "Obligatoriska fält för vald kundtyp saknas.",
  // Sökväg till det fält som ska visa felet, kan justeras för bättre UX
  path: ["companyName", "firstName"], 
});
