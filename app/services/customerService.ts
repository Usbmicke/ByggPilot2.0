
import { firestoreAdmin } from '@/lib/firebase-admin';
import { Customer } from '@/types/index';
import { FieldValue } from 'firebase-admin/firestore';

const db = firestoreAdmin;
const customersCollection = db.collection('customers');

// =================================================================================
// NYCKELFUNKTION: findOrCreateUserByProvider
// Denna funktion är den kritiska länken mellan NextAuth-inloggning och din databas.
// Den säkerställer att varje användare som loggar in via en provider (Google)
// antingen hittas eller skapas i din 'customers'-collection.
// =================================================================================
export async function findOrCreateUserByProvider(userData: {
    provider: string;
    providerAccountId: string;
    email: string;
    name: string;
    imageUrl?: string | null;
}): Promise<Customer> {
    // 1. Hitta användaren baserat på provider och providerAccountId
    const querySnapshot = await customersCollection
        .where('provider', '==', userData.provider)
        .where('providerAccountId', '==', userData.providerAccountId)
        .limit(1)
        .get();

    if (!querySnapshot.empty) {
        // 2a. Användaren finns, returnera den. (Möjlighet att uppdatera info här om det behövs)
        const userDoc = querySnapshot.docs[0];
        // Optional: Uppdatera namn och bild om de har ändrats hos providern
        await userDoc.ref.update({
            name: userData.name,
            imageUrl: userData.imageUrl,
        });
        return { id: userDoc.id, ...userDoc.data() } as Customer;
    } else {
        // 2b. Användaren finns inte, skapa en ny.
        const newCustomerData = {
            ...userData,
            createdAt: FieldValue.serverTimestamp(),
            archivedAt: null,
            // Sätt eventuella andra standardvärden för nya kunder här
        };
        const docRef = await customersCollection.add(newCustomerData);
        const newUserDoc = await docRef.get();
        return { id: newUserDoc.id, ...newUserDoc.data() } as Customer;
    }
}


// --- Befintliga CRUD Funktioner ---

export async function listCustomers(userId: string): Promise<Customer[]> {
    const snapshot = await customersCollection
        .where('userId', '==', userId)
        .where('archivedAt', '==', null)
        .get();
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

export async function listAllCustomersForUser(userId: string): Promise<Customer[]> {
    const snapshot = await customersCollection.where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
}

export async function listArchivedCustomers(userId: string): Promise<Customer[]> {
    const snapshot = await customersCollection
        .where('userId', '==', userId)
        .where('archivedAt', '!=', null)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
}
