
'use server';

import { firestoreAdmin } from '@/lib/admin'; // Korrigerad import
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

interface CustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  orgNumber?: string;
}

// Funktion för att skapa en ny kund
export async function createCustomer(data: CustomerData, userId: string) {
  if (!userId) {
    return { success: false, error: 'Användar-ID är obligatoriskt.' };
  }

  const userCustomersRef = firestoreAdmin.collection('users').doc(userId).collection('customers');

  try {
    const newCustomerRef = userCustomersRef.doc();
    const newCustomerData = {
      ...data,
      id: newCustomerRef.id, // Spara dokument-ID i fältet
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    await newCustomerRef.set(newCustomerData);
    
    // Revalidera sökvägen till kundlistan. Detta uppdaterar datan för alla användare.
    revalidatePath('/dashboard/customers');

    console.log(`Ny kund skapad med ID: ${newCustomerRef.id} för användare ${userId}`);
    
    // Returnera det fullständiga kundobjektet (utan server-timestamps)
    return { success: true, customer: { ...newCustomerData, id: newCustomerRef.id } };

  } catch (error) {
    console.error("Fel vid skapande av kund:", error);
    return { success: false, error: 'Kunde inte skapa kund på servern.' };
  }
}

// Funktion för att hämta alla kunder för en specifik användare
export async function getCustomers(userId: string) {
  if (!userId) {
    console.log("getCustomers anropades utan userId");
    return { customers: [], error: 'Användar-ID är obligatoriskt.' };
  }

  try {
    const customersSnapshot = await firestoreAdmin
      .collection('users').doc(userId).collection('customers')
      .orderBy('name', 'asc')
      .get();

    const customers = customersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name || 'Namn saknas',
            email: data.email || ''
            // Lägg till andra fält vid behov
        };
    });
    
    return { customers };

  } catch (error) {
    console.error("Fel vid hämtning av kunder:", error);
    return { customers: [], error: 'Kunde inte hämta kunder från servern.' };
  }
}
