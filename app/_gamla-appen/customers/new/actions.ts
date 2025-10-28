'use server';

import { getServerSession } from '@/app/lib/auth';
import { createCustomer } from '@/app/services/customerService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Customer } from '@/app/types';

export async function createCustomerAction(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('Authentication is required to perform this action.');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string | undefined;
  const phone = formData.get('phone') as string | undefined;
  // En checkbox skickar värdet 'on' om den är ikryssad, annars null.
  const isCompany = formData.get('isCompany') === 'on';

  if (!name) {
    // Detta bör hanteras med validering på klientsidan också, men är en extra säkerhet.
    throw new Error('Customer name is required.');
  }

  const customerData: Omit<Customer, 'id' | 'createdAt'> = {
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
    // I en produktionsapplikation skulle du vilja ha mer sofistikerad felhantering,
    // kanske returnera ett objekt med ett felmeddelande som kan visas i UI:t.
    throw new Error('Could not create the customer due to a server error.');
  }

  // Invalidera cachen för kundlistan. Detta säkerställer att när vi omdirigerar,
  // kommer sidan /customers att hämta den uppdaterade listan med kunder.
  revalidatePath('/customers');
  
  // Omdirigera användaren tillbaka till kundlistan för att se den nyligen tillagda kunden.
  redirect('/customers');
}
