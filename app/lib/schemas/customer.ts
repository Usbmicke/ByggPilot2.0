
import { z } from 'zod';

// =====================================================================================
// KUND-SCHEMA (ZOD)
// Garanterar dataintegritet och transformerar data för att matcha Customer-typen.
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
    return false; 
  }
  if (data.customerType === 'PrivatePerson' && (!data.firstName || !data.lastName)) {
    return false;
  }
  return true;
}, {
  message: "Obligatoriska fält för vald kundtyp saknas.",
  path: ["companyName", "firstName"], 
})
// VÄRLDSKLASS-TRANSFORMATION: Skapar dynamiskt 'name'-fältet för att matcha Customer-typen.
.transform((data) => {
    const name = data.customerType === 'Company' 
        ? data.companyName 
        : `${data.firstName} ${data.lastName}`;
    return {
        ...data,
        name: name! // Säkerställer att namnet är en sträng baserat på refine-logiken ovan.
    };
});
