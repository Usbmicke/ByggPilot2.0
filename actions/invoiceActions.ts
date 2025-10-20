
'use server';

import * as dal from '@/lib/data-access';
import logger from '@/lib/logger';
import { Invoice } from '@/types';

// =================================================================================
// GULDSTANDARD - ACTIONS V4.0 (DAL-REFAKTORERAD)
// REVIDERING: All direkt databasåtkomst är borttagen. Funktionen anropar nu
//             Data Access Layer (DAL) för att skapa fakturor. Detta säkerställer
//             att all logik är centraliserad, säker och konsekvent.
// =================================================================================

// Typdefinition för vad som kommer in från formuläret
export type InvoiceCreationData = Omit<Invoice, 'id' | 'status' | 'totalAmount' | 'createdAt' | 'updatedAt'>;

/**
 * Skapar en ny faktura (Invoice) genom att anropa Data Access Layer.
 */
export async function createInvoice(invoiceData: InvoiceCreationData): Promise<{ invoice?: Invoice; error?: string; }> {
    try {
        // DAL hanterar användarverifiering, validering och databasskrivningar.
        const newInvoice = await dal.createInvoice(invoiceData);
        return { invoice: newInvoice };
    } catch (error: any) {
        logger.error({ 
            error: error.message, 
            stack: error.stack,
            invoiceData 
        }, '[invoiceActions] Failed to create invoice.');
        
        return { error: 'Kunde inte skapa fakturan på grund av ett serverfel.' };
    }
}
