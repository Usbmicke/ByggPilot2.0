import { collection, doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { firestore as db } from '@/lib/config/firebase-client';
import { Invoice, InvoiceCreationData, InvoiceLine, Customer } from '@/app/types';

async function getCustomer(customerId: string): Promise<Customer> {
    const customerRef = doc(db, 'customers', customerId);
    const customerSnap = await getDoc(customerRef);
    if (!customerSnap.exists()) {
        throw new Error(`Kund med ID ${customerId} kunde inte hittas.`);
    }
    return { id: customerSnap.id, ...customerSnap.data() } as Customer;
}

export async function createInvoiceInDAL(invoiceData: InvoiceCreationData): Promise<{ id: string; newInvoiceForDb: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'> & { createdAt: any } }> {
    const batch = writeBatch(db);
    const customer = invoiceData.customer;
    const transformedLines: InvoiceLine[] = invoiceData.invoiceLines.map(line => ({
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
    }));

    const totalAmount = transformedLines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0);
    
    const newInvoiceForDb = {
        projectId: invoiceData.projectId,
        customer: customer,
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

    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
        const currentInvoiced = projectSnap.data().totalInvoiced || 0;
        batch.update(projectRef, { totalInvoiced: currentInvoiced + totalAmount });
    }

    await batch.commit();

    return {
        id: invoiceDocRef.id,
        newInvoiceForDb,
    };
}
