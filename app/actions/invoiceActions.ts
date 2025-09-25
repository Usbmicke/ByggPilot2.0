
'use server';

import { firestore } from '@/app/lib/firebase/firestore';
import { Invoice } from '@/app/types';
import { collection, addDoc, serverTimestamp, doc, getDoc, writeBatch } from 'firebase/firestore';

// Typdefinition för vad som kommer in från formuläret
export type InvoiceCreationData = Omit<Invoice, 'id' | 'status' | 'totalAmount'>;

/**
 * Skapar en ny offert (Invoice) i Firestore och uppdaterar projektets total.
 */
export async function createInvoice(invoiceData: InvoiceCreationData) {
    try {
        const batch = writeBatch(firestore);

        // 1. Beräkna totalbeloppet
        const totalAmount = invoiceData.lines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0);

        // 2. Skapa det fullständiga invoice-objektet
        const newInvoice: Omit<Invoice, 'id'> = {
            ...invoiceData,
            status: 'draft', // Startar som ett utkast
            totalAmount,
            createdAt: serverTimestamp(),
        };

        // 3. Lägg till den nya offerten i en sub-collection under projektet
        const projectRef = doc(firestore, 'projects', invoiceData.projectId);
        const invoicesCollectionRef = collection(projectRef, 'invoices');
        const invoiceDocRef = doc(invoicesCollectionRef); // Skapa en referens med auto-genererat ID

        batch.set(invoiceDocRef, newInvoice);

        // 4. Hämta projektet för att uppdatera dess totala fakturerade summa (valfritt men bra praxis)
        // Denna del kan utvecklas vidare, t.ex. för att särskilja offerter från fakturor
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
            const currentInvoiced = projectSnap.data().totalInvoiced || 0;
            batch.update(projectRef, { totalInvoiced: currentInvoiced + totalAmount });
        }

        // 5. Genomför alla skrivningar atomärt
        await batch.commit();

        console.log(`Offert med ID ${invoiceDocRef.id} skapades för projekt ${invoiceData.projectId}.`);

        // Returnera det fullständiga objektet med det nya ID:t
        return { 
            success: true, 
            invoice: { ...newInvoice, id: invoiceDocRef.id } as Invoice 
        };

    } catch (error) {
        console.error("Fel vid skapande av offert i server action:", error);
        // Kasta om felet så att anroparen kan hantera det
        // throw new Error('Kunde inte skapa offerten på grund av ett serverfel.');
        return {
            success: false,
            error: 'Kunde inte skapa offerten på grund av ett serverfel.'
        }
    }
}
