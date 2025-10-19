'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateCustomer, archiveCustomer } from '@/app/(main)/customers/actions'; 

// Action för att uppdatera en kund
export async function updateCustomerAction(customerId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    isCompany: formData.get('isCompany') === 'on',
  };

  try {
    await updateCustomer(customerId, session.user.id, data);
    revalidatePath('/customers'); 
    revalidatePath(`/customers/${customerId}/edit`); 
  } catch (error) {
    console.error("Kunde inte uppdatera kund:", error);
    // Hantera fel (t.ex. returnera ett felmeddelande)
  }
}

// Action för att arkivera en kund
export async function archiveCustomerAction(customerId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  try {
    await archiveCustomer(customerId, session.user.id);
    revalidatePath('/customers');
    redirect('/customers'); 
  } catch (error) {
    console.error("Kunde inte arkivera kund:", error);
    // Hantera fel
  }
}
