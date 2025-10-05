
'use server';

import { firestoreAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

interface CustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  orgNumber?: string;
  // userId för att veta vilken användare kunden tillhör
  userId: string; 
}

// Funktion för att skapa en ny kund
export async function createCustomer(data: Omit<CustomerData, 'userId'>, userId: string) {
  if (!userId) {
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const newCustomerRef = firestoreAdmin.collection('customers').doc();
    await newCustomerRef.set({
      ...data,
      id: newCustomerRef.id,
      userId: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`Ny kund skapad med ID: ${newCustomerRef.id} för användare ${userId}`);
    return { success: true, customerId: newCustomerRef.id };
  } catch (error) {
    console.error("Fel vid skapande av kund:", error);
    return { success: false, error: 'Kunde inte skapa kund på servern.' };
  }
}

// Funktion för att hämta alla kunder för en specifik användare
export async function getCustomers(userId: string) {
  if (!userId) {
    return { success: false, error: 'Användar-ID saknas.' };
  }

  try {
    const customersSnapshot = await firestoreAdmin
      .collection('customers')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const customers = customersSnapshot.docs.map(doc => doc.data());
    return { success: true, data: customers };

  } catch (error) {
    console.error("Fel vid hämtning av kunder:", error);
    return { success: false, error: 'Kunde inte hämta kunder från servern.' };
  }
}
