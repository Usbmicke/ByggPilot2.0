
'use server';

import { revalidatePath } from 'next/cache';
import { createCustomerInDb, getCustomersFromDb } from '../lib/dal/customer';
// ARKITEKTURKORRIGERING: Korrekt relativ sökväg till det nyskapade schemat.
import { customerSchema } from '../lib/schemas/customer';

/**
 * GULDSTANDARD SERVER ACTION: createCustomer
 * Validerar kunddata mot ett Zod-schema och anropar sedan DAL för att skapa kunden.
 * Hanterar fel och returnerar ett standardiserat svarsformat.
 */
export async function createCustomer(customerData: any) {
  const validationResult = customerSchema.safeParse(customerData);

  if (!validationResult.success) {
    console.error('Zod validation failed:', validationResult.error.flatten());
    return {
      status: 'error',
      message: `Valideringsfel: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`,
    };
  }

  try {
    const customerId = await createCustomerInDb(validationResult.data);
    revalidatePath('/dashboard/customers');

    return {
      status: 'success',
      message: 'Kunden har skapats framgångsrikt!',
      customerId: customerId,
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      status: 'error',
      message: 'Kunde inte skapa kunden på grund av ett internt serverfel.',
    };
  }
}

/**
 * GULDSTANDARD SERVER ACTION: getCustomers
 * Anropar DAL för att hämta en lista över alla kunder.
 * Minimerar logiken i server-actions och delegerar databashantering.
 */
export async function getCustomers() {
  try {
    const customers = await getCustomersFromDb();
    return customers;
  } catch (error) {
    console.error('Failed to get customers in server action:', error);
    throw new Error('Kunde inte hämta kundlistan.');
  }
}
