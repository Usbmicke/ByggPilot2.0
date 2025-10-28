
'use server';

import { db } from '@/app/lib/firebase/firestore';
import { Invoice, InvoiceCreationData, InvoiceLine } from '@/app/types';
import { collection, addDoc, serverTimestamp, doc, getDoc, writeBatch } from 'firebase/firestore';

/**
 * Skapar en ny faktura (Invoice) i Firestore och uppdaterar projektets total.
 * VÄRLDSKLASS-KORRIGERING: Anpassad till den centraliserade typdefinitionen i app/types/index.ts.
 * - `invoiceLines` har bytt namn till `lines`.
 * - `unitPrice` på InvoiceLine har bytt namn till `pricePerUnit`.
 * - Status-värdet `"Utkast"` har korrigerats till `"Draft"`.
 */
export async function createInvoice(invoiceData: InvoiceCreationData) {
    try {
        const batch = writeBatch(db);

        // 1. Beräkna totalbeloppet från de korrekta fälten.
        const totalAmount = invoiceData.lines.reduce((acc: number, line: InvoiceLine) => acc + (line.quantity * line.pricePerUnit), 0);

        // 2. Skapa det fullständiga invoice-objektet med korrekt status.
        const newInvoice: Omit<Invoice, 'id' | 'invoiceNumber'> = {
            ...invoiceData,
            status: 'Draft', // Korrekt status enligt enum
            totalAmount,
            createdAt: serverTimestamp(),
        };

        // 3. Lägg till den nya fakturan i en sub-collection under projektet
        const projectRef = doc(db, 'projects', invoiceData.projectId);
        const invoicesCollectionRef = collection(projectRef, 'invoices');
        // Skapa en referens med auto-genererat ID. InvoiceNumber måste hanteras separat.
        const invoiceDocRef = doc(invoicesCollectionRef); 

        batch.set(invoiceDocRef, newInvoice);

        // 4. Hämta projektet för att uppdatera dess totala fakturerade summa
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
            const currentInvoiced = projectSnap.data().totalInvoiced || 0;
            batch.update(projectRef, { totalInvoiced: currentInvoiced + totalAmount });
        }

        // 5. Genomför alla skrivningar atomärt
        await batch.commit();

        console.log(`Faktura med ID ${invoiceDocRef.id} skapades för projekt ${invoiceData.projectId}.`);

        // Returnera det fullständiga objektet med det nya ID:t
        // Notera: invoiceNumber måste genereras och läggas till i ett senare skede.
        return { 
            success: true, 
            invoice: { ...newInvoice, id: invoiceDocRef.id, invoiceNumber: 'temp-placeholder' } as Invoice 
        };

    } catch (error) {
        console.error("Fel vid skapande av faktura i server action:", error);
        return {
            success: false,
            error: 'Kunde inte skapa fakturan på grund av ett serverfel.'
        }
    }
}
