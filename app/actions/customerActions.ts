
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/services/firestoreService';
import { collection, addDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { Customer } from '@/app/types';

/**
 * GULDSTANDARD ACTION: `createCustomer`
 * Skapar en ny kund för den autentiserade användaren.
 * Hämtar användar-ID säkert från server-sessionen.
 */
export async function createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'userId'>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.uid) {
    return { success: false, error: 'Autentisering krävs.' };
  }
  const userId = session.user.uid;

  try {
    // Indata-validering (kan utökas vid behov)
    if (!customerData.name) {
      return { success: false, error: 'Kundnamn är obligatoriskt.' };
    }

    const customersCollectionRef = collection(db, 'users', userId, 'customers');
    
    const newDocRef = await addDoc(customersCollectionRef, {
      ...customerData,
      userId: userId, // Säkerställ att rätt userId associeras
      createdAt: serverTimestamp(),
    });

    return { success: true, customerId: newDocRef.id };

  } catch (error) {
    console.error('Fel vid skapande av kund:', error);
    return { success: false, error: 'Ett serverfel uppstod vid skapande av kund.' };
  }
}

/**
 * GULDSTANDARD ACTION: `getCustomers`
 * Hämtar alla kunder för den autentiserade användaren.
 * Hämtar användar-ID säkert från server-sessionen.
 */
export async function getCustomers() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.uid) {
    return { success: false, error: 'Autentisering krävs.' };
  }
  const userId = session.user.uid;

  try {
    const customersCollectionRef = collection(db, 'users', userId, 'customers');
    const q = query(customersCollectionRef); // Ingen 'where'-sats behövs, sökvägen är säker nog.
    const querySnapshot = await getDocs(q);

    const customers = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Customer[];

    return { success: true, data: customers };

  } catch (error) {
    console.error('Fel vid hämtning av kunder:', error);
    return { success: false, error: 'Ett serverfel uppstod vid hämtning av kunder.' };
  }
}
