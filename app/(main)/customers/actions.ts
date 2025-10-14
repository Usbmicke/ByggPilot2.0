'use server';

import { firestoreAdmin } from '@/lib/admin';
import { Customer } from '@/types/index';
import { FieldValue } from 'firebase-admin/firestore';

const db = firestoreAdmin;
const customersCollection = db.collection('customers');

export async function listCustomers(userId: string): Promise<Customer[]> {
    const snapshot = await customersCollection
        .where('userId', '==', userId)
        .where('archivedAt', '==', null)
        .get();
    
    if (snapshot.empty) {
        return [];
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
}

export async function getCustomer(id: string, userId: string): Promise<Customer | null> {
    const doc = await customersCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    const customer = { id: doc.id, ...doc.data() } as Customer;
    // Verifiera att kunden tillhör användaren och inte är arkiverad
    if (customer.userId !== userId || customer.archivedAt) {
        return null;
    }
    return customer;
}

export async function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'archivedAt'>): Promise<Customer> {
    const newCustomerData = {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        archivedAt: null,
    };
    const docRef = await customersCollection.add(newCustomerData);
    return { id: docRef.id, ...newCustomerData } as Customer;
}

export async function updateCustomer(id: string, userId: string, data: Partial<Customer>): Promise<Customer> {
    const customerRef = customersCollection.doc(id);
    const doc = await customerRef.get();

    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error('Customer not found or access denied.');
    }

    await customerRef.update(data);
    const updatedDoc = await customerRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Customer;
}

export async function archiveCustomer(id: string, userId: string): Promise<void> {
    const customerRef = customersCollection.doc(id);
    const doc = await customerRef.get();

    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error('Customer not found or access denied.');
    }

    await customerRef.update({ archivedAt: FieldValue.serverTimestamp() });
}
