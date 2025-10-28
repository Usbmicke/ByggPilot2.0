
'use server';

import { db } from '@/app/lib/firebase-admin';
import { Customer, customerSchema } from '@/app/types/index';
import { revalidatePath } from 'next/cache';

// ... (befintlig createCustomer-funktion)

/**
 * GULDSTANDARD SERVER ACTION: createCustomer
 * ... (dokumentation oförändrad)
 */
export async function createCustomer(customerData: any) {
  const validationResult = customerSchema.safeParse(customerData);
  if (!validationResult.success) {
    console.error('Zod validation failed:', validationResult.error.flatten());
    return {
        status: 'error',
        message: `Valideringsfel: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`
    }
  }
  try {
    const newCustomerRef = await db.collection('customers').add(validationResult.data);
    revalidatePath('/dashboard/customers'); 
    return {
      status: 'success',
      message: 'Kunden har skapats framgångsrikt!',
      customerId: newCustomerRef.id
    };
  } catch (error) {
    console.error('Error creating customer in Firestore:', error);
    return {
        status: 'error',
        message: 'Kunde inte skapa kunden i databasen på grund av ett internt serverfel.'
    }
  }
}

/**
 * GULDSTANDARD SERVER ACTION: getCustomers
 * Hämtar en lista över alla kunder från Firestore.
 * Returnerar enbart nödvändiga fält för att populera en dropdown-meny,
 * vilket minimerar datamängden som skickas till klienten.
 * Inkluderar robust felhantering.
 */
export async function getCustomers() {
    try {
        const customersSnapshot = await db.collection('customers').get();
        
        if (customersSnapshot.empty) {
            return [];
        }

        // Mappa dokumenten till ett mer användbart format
        const customers = customersSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().companyName || doc.data().name, // Stöd för både företagsnamn och personnamn
        }));

        return customers;

    } catch (error) {
        console.error("Fel vid hämtning av kunder från Firestore:", error);
        // Kasta felet vidare så att anropande kod kan hantera det
        throw new Error("Kunde inte hämta kundlistan.");
    }
}

