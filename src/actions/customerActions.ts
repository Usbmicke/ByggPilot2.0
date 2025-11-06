'use server';

import { firestoreAdmin } from '@/lib/config/firebase-admin';

/**
 * Hämtar alla kunder från Firestore-databasen.
 * Använder admin-SDK för säker server-side datahämtning.
 * @returns {Promise<Array<Object>>} En lista med kundobjekt.
 */
export const getCustomers = async () => {
  try {
    const customersSnapshot = await firestoreAdmin.collection('customers').get();
    if (customersSnapshot.empty) {
      return [];
    }
    
    // Mappar dokumentdata och lägger till dokument-ID.
    const customers = customersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return customers;
  } catch (error) {
    console.error('Fel vid hämtning av kunder:', error);
    // Returnerar en tom lista vid fel för att undvika att klienten kraschar.
    return []; 
  }
};
