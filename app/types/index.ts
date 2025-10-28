
import { z } from 'zod';

// ========================================================================
//  KÄRNTYPER FÖR PROJEKT, KUNDER, ETC.
// ========================================================================

export const customerSchema = z.object({
  name: z.string().min(1, "Kundnamn är obligatoriskt"),
  email: z.string().email("Ogiltig e-postadress").optional().or(z.literal(''))
});

export type ProjectStatus = 'Offert' | 'Pågående' | 'Avslutad' | 'Fakturerat' | 'Arkiverat' | 'Varning' | 'Positiv';

export interface Project {
  id: string; // Unikt ID för projektet
  userId: string; // ID för användaren som äger projektet
  projectNumber: string; // Formaterat projektnummer, t.ex. P2023-001
  projectName: string; // Projektnamn, t.ex. "Renovering Villa Larsson"
  clientName: string; // Kundens namn
  status: ProjectStatus; // Projektets nuvarande status
}

export interface TimeEntry {
    id: string;
    projectId: string;
    date: string; // ISO 8601-format: "YYYY-MM-DD"
    hours: number;
    description: string;
    // userId?: string; // Om du behöver spåra vem som rapporterade
}

export type CalculationCategory = 'Material' | 'Arbete' | 'Underentreprenör' | 'Övrigt';

export interface CalculationItem {
    id: string; 
    description: string; 
    quantity: number; 
    unit: string; 
    unitPrice: number; 
    category: CalculationCategory; 
}

export interface Calculation {
    items: CalculationItem[];
    profitMarginPercentage: number; 
}

export interface Material {
    id: string; // Unikt ID
    name: string; // Artikelnamn, t.ex. "Trall 28x120 Imp."
    supplier: string; // Leverantör, t.ex. "Beijer Bygg"
    price: number; // Inköpspris
    unit: string; // Enhet, t.ex. "lpm", "st", "m2"
}

export interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    // Framtida fält kan inkludera roller, etc.
    // role?: 'admin' | 'user'; 
}

// ========================================================================
//  TYPER FÖR CHAT & ANVÄNDARGRÄNSSNITT
// ========================================================================

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
    role: ChatRole;
    content: string;
    attachment?: {
        name: string;
        content: string; // Base64-kodad data-URL
    };
}
