
'use server';

import { db } from '@/app/lib/firebase/firestore';
import { Invoice, InvoiceCreationData, InvoiceLine, Customer } from '@/app/types';
import { collection, doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

// Hämta kundinformation - en robustare metod.
async function getCustomer(customerId: string): Promise<Customer> {
    const customerRef = doc(db, 'customers', customerId);
    const customerSnap = await getDoc(customerRef);
    if (!customerSnap.exists()) {
        throw new Error(`Kund med ID ${customerId} kunde inte hittas.`);
    }
    return { id: customerSnap.id, ...customerSnap.data() } as Customer;
}


/**
 * Skapar en ny faktura (Invoice) i Firestore och uppdaterar projektets total.
 * VÄRLDSKLASS-KORRIGERING: Denna funktion är nu fullständigt typ-säker och följer 
 * de centraliserade typerna i app/types/index.ts.
 */
export async function createInvoice(invoiceData: InvoiceCreationData) {
    try {
        const batch = writeBatch(db);

        // VÄRLDSKLASS-KORRIGERING: Använd det fullständiga kundobjektet direkt, enligt InvoiceCreationData-typen.
        const customer = invoiceData.customer;

        // VÄRLDSKLASS-TRANSFORMATION: Säkerställ att fakturaraderna exakt matchar InvoiceLine-typen.
        // Inga fler 'vatRate' eller 'pricePerUnit'.
        const transformedLines: InvoiceLine[] = invoiceData.invoiceLines.map(line => ({
            description: line.description,
            quantity: line.quantity,
            unit: line.unit, // Korrekt fält 'unit'
            unitPrice: line.unitPrice, // Korrekt fält 'unitPrice'
        }));

        // Korrekt beräkning av totalbelopp.
        const totalAmount = transformedLines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0);
        
        // Skapa ett komplett och typ-säkert objekt för databasen.
        const newInvoiceForDb = {
            projectId: invoiceData.projectId,
            customer: customer, // Hela objektet, inte bara IDt.
            status: 'Draft' as const,
            invoiceLines: transformedLines,
            rotDeduction: invoiceData.rotDeduction,
            issueDate: invoiceData.issueDate,
            dueDate: invoiceData.dueDate,
            totalAmount,
            createdAt: serverTimestamp(),
        };

        const projectRef = doc(db, 'projects', invoiceData.projectId);
        const invoiceDocRef = doc(collection(db, 'invoices'));

        batch.set(invoiceDocRef, newInvoiceForDb);

        // Uppdatera projektets totala fakturerade summa.
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
            const currentInvoiced = projectSnap.data().totalInvoiced || 0;
            batch.update(projectRef, { totalInvoiced: currentInvoiced + totalAmount });
        }

        await batch.commit();

        const newInvoiceId = invoiceDocRef.id;
        console.log(`Faktura med ID ${newInvoiceId} skapades för projekt ${invoiceData.projectId}.`);

        // Returnera ett komplett Invoice-objekt (med rimliga client-side fallbacks).
        return {
            success: true,
            invoice: {
                ...newInvoiceForDb,
                id: newInvoiceId,
                invoiceNumber: 'temp-placeholder', // Bör genereras baserat på ett löpnummer-system.
                createdAt: new Date(), // Använd klient-tid som fallback för omedelbar UI-uppdatering.
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
