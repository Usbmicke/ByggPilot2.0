
import { collection, getDocs, addDoc, doc, getDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
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
 * Fetches a single customer by their ID.
 * @param customerId - The ID of the customer to fetch.
 * @returns A promise that resolves to the customer, or null if not found.
 */
export async function getCustomer(customerId: string): Promise<Customer | null> {
    if (!customerId) {
        console.error("getCustomer: customerId is required");
        return null;
    }
    try {
        const docRef = doc(db, 'customers', customerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                isCompany: data.isCompany,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching customer ${customerId}:`, error);
        return null;
    }
}

/**
 * Lists all customers belonging to a specific user.
 */
export async function listCustomers(ownerId: string): Promise<Customer[]> {
  if (!ownerId) {
    console.error("listCustomers: ownerId is required");
    return [];
  }

  try {
    const q = query(
      collection(db, 'customers'),
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
    return [];
  }
}

/**
 * Creates a new customer for a specific user.
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
      createdAt: new Date().toISOString(), 
    };

    return newCustomer;
  } catch (error) {
    console.error("Error creating customer: ", error);
    throw new Error('Failed to create customer in Firestore.');
  }
}
