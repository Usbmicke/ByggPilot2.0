'use server';

import { createInvoiceInDAL } from '@/lib/dal/invoices';
import { Invoice, InvoiceCreationData } from '@/app/types';

export async function createInvoice(invoiceData: InvoiceCreationData) {
    try {
        const { id, newInvoiceForDb } = await createInvoiceInDAL(invoiceData);

        console.log(`Faktura med ID ${id} skapades för projekt ${invoiceData.projectId}.`);

        return {
            success: true,
            invoice: {
                ...newInvoiceForDb,
                id: id,
                invoiceNumber: 'temp-placeholder', 
                createdAt: new Date(),
            } as Invoice
        };

    } catch (error) {
        console.error("Fel vid skapande av faktura i server action:", error);
        const errorMessage = error instanceof Error ? error.message : 'Kunde inte skapa fakturan på grund av ett serverfel.';
        return {
            success: false,
            error: errorMessage,
        }
    }
}
