'use server';

import { getServerSession } from '@/app/lib/auth';
import { updateCustomer, archiveCustomer } from '@/app/services/customerService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Customer } from '@/app/types';

export async function updateCustomerAction(customerId: string, formData: FormData) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Authentication is required.');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string | null;
  const phone = formData.get('phone') as string | null;
  const isCompany = formData.get('isCompany') === 'on';

  if (!name) {
    throw new Error('Name is a required field.');
  }

  const updatedData: Partial<Customer> = {
    name,
    email,
    phone,
    isCompany,
  };

  try {
    await updateCustomer(customerId, userId, updatedData);
  } catch (error) {
    console.error("Failed to update customer:", error);
    throw new Error('Could not update the customer due to a server error.');
  }

  revalidatePath('/customers');
  revalidatePath(`/customers/${customerId}/edit`);
  revalidatePath('/dashboard');

  redirect('/customers');
}


export async function archiveCustomerAction(customerId: string) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Authentication is required.');
  }

  try {
    // VIKTIGT: Här kan vi behöva lägga till logik för att också arkivera kundens projekt.
    // För nu håller vi det enkelt och arkiverar bara kunden.
    await archiveCustomer(customerId, userId);
  } catch (error) {
    console.error("Failed to archive customer:", error);
    throw new Error('Could not archive the customer due to a server error.');
  }

  // Rensa cachen för listor där kunden inte längre ska synas
  revalidatePath('/customers');
  revalidatePath('/dashboard');

  // Omdirigera till kundlistan där kunden nu är borta
  redirect('/customers');
}
