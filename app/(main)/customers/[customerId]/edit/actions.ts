
'use server';

import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth'; // KORRIGERAD IMPORT
import { updateCustomerInFirestore, archiveCustomerInFirestore } from '@/services/customerService';

interface FormData {
    customerId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    orgNumber: string;
    zipCode: string;
    city: string;
}

export async function updateCustomerAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Autentisering krävs.');
    }

    const { customerId, ...customerData } = formData;

    if (!customerId) {
        throw new Error('Kund-ID saknas.');
    }

    try {
        await updateCustomerInFirestore(customerId, customerData);
        console.log(`[ACTION] Kund ${customerId} uppdaterad.`);

        revalidatePath(`/customers/${customerId}`);
        revalidatePath('/customers');
        redirect(`/customers/${customerId}`);
    } catch (error) {
        console.error(`[ACTION ERROR] Det gick inte att uppdatera kund ${customerId}:`, error);
        throw new Error('Ett serverfel inträffade vid uppdatering av kund.');
    }
}

export async function archiveCustomerAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Autentisering krävs.');
    }

    const { customerId } = formData;

    if (!customerId) {
        throw new Error('Kund-ID saknas.');
    }

    try {
        await archiveCustomerInFirestore(customerId);
        console.log(`[ACTION] Kund ${customerId} arkiverad.`);

        revalidatePath('/customers');
        revalidatePath('/dashboard');
        redirect('/customers');
    } catch (error) {
        console.error(`[ACTION ERROR] Det gick inte att arkivera kund ${customerId}:`, error);
        throw new Error('Ett serverfel inträffade vid arkivering av kund.');
    }
}
