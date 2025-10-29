
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { Customer } from '@/lib/schemas/project';

/**
 * Creates a new customer in the Firestore database.
 * @param customerData - The data for the new customer.
 * @returns The ID of the newly created customer.
 */
export async function createCustomerInDb(customerData: Omit<Customer, 'id'>): Promise<string> {
  try {
    const newCustomerRef = await firestoreAdmin.collection('customers').add(customerData);
    return newCustomerRef.id;
  } catch (error) {
    console.error('Error creating customer in Firestore:', error);
    throw new Error('Failed to create customer in the database.');
  }
}

/**
 * Retrieves a list of all customers from Firestore.
 * @returns A list of customers with their ID and name.
 */
export async function getCustomersFromDb(): Promise<{ id: string; name: string; }[]> {
  try {
    const customersSnapshot = await firestoreAdmin.collection('customers').get();
    
    if (customersSnapshot.empty) {
      return [];
    }

    const customers = customersSnapshot.docs.map((doc: { data: () => any; id: any; }) => {
      const data = doc.data();
      const name = data.customerType === 'Company' ? data.companyName : `${data.firstName} ${data.lastName}`;
      return {
        id: doc.id,
        name: name || 'Namn saknas',
      };
    });

    return customers;
  } catch (error) {
    console.error("Error fetching customers from Firestore:", error);
    throw new Error("Could not fetch the customer list.");
  }
}
