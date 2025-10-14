'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // KORRIGERAD IMPORT
import { createCustomer } from '../../actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Customer } from '@/types';

export async function createCustomerAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Authentication is required to perform this action.');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string | undefined;
  const phone = formData.get('phone') as string | undefined;
  const isCompany = formData.get('isCompany') === 'on';

  if (!name) {
    throw new Error('Customer name is required.');
  }

  const customerData: Omit<Customer, 'id' | 'createdAt' | 'archivedAt'> = {
    name,
    email: email || '',
    phone: phone || '',
    isCompany,
    userId: session.user.id,
  };

  try {
    await createCustomer(customerData);
  } catch (error) {
    console.error('Failed to create customer:', error);
    throw new Error('Could not create the customer due to a server error.');
  }

  revalidatePath('/customers');
  
  redirect('/customers');
}
