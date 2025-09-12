
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { Customer } from '@/app/types';

interface CreateCustomerData {
  name: string;
  ownerId: string;
  isCompany: boolean;
  email?: string;
  phone?: string;
}

/**
 * Lists all customers belonging to a specific user.
 * @param ownerId - The ID of the user whose customers to fetch.
 * @returns A promise that resolves to an array of customers.
 */
export async function listCustomers(ownerId: string): Promise<Customer[]> {
  if (!ownerId) {
    console.error("listCustomers: ownerId is required");
    return [];
  }

  try {
    const customersCollection = collection(db, 'customers');
    const q = query(
      customersCollection,
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const customers: Customer[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        isCompany: data.isCompany,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      };
    });

    return customers;
  } catch (error) {
    console.error("Error fetching customers: ", error);
    // In a real app, you might want to handle this more gracefully
    return [];
  }
}

/**
 * Creates a new customer for a specific user.
 * @param customerData - The data for the new customer.
 * @returns A promise that resolves to the newly created customer.
 */
export async function createCustomer(customerData: CreateCustomerData): Promise<Customer> {
  const { name, ownerId, isCompany, email, phone } = customerData;

  if (!name || !ownerId) {
    throw new Error('Name and ownerId are required to create a customer.');
  }

  try {
    const docRef = await addDoc(collection(db, "customers"), {
      name,
      ownerId,
      isCompany,
      email,
      phone,
      createdAt: serverTimestamp(),
    });

    const newCustomer: Customer = {
      id: docRef.id,
      name,
      ownerId,
      isCompany,
      email,
      phone,
      createdAt: new Date().toISOString(), // Use current date as a temporary timestamp
    };

    return newCustomer;
  } catch (error) {
    console.error("Error creating customer: ", error);
    throw new Error('Failed to create customer in Firestore.');
  }
}
