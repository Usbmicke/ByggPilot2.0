import { promises as fs } from 'fs';
import path from 'path';
import { Customer } from '@/app/types';
import { revalidatePath } from 'next/cache';

const dataFilePath = path.join(process.cwd(), 'app/data/customers.json');

async function readData(): Promise<Customer[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent) as Customer[];
  } catch (error) {
    // Om filen inte finns, returnera en tom array.
    return [];
  }
}

async function writeData(data: Customer[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// --- CRUD Funktioner ---

export async function listCustomers(userId: string): Promise<Customer[]> {
  const allCustomers = await readData();
  // Returnera endast aktiva kunder för den specifika användaren
  return allCustomers.filter(c => c.userId === userId && c.archivedAt === null);
}

export async function getCustomer(id: string, userId: string): Promise<Customer | null> {
  const allCustomers = await readData();
  const customer = allCustomers.find(c => c.id === id && c.userId === userId);
  // Returnera endast om den inte är arkiverad
  return customer && customer.archivedAt === null ? customer : null;
}

export async function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'archivedAt'>): Promise<Customer> {
  const allCustomers = await readData();
  const newCustomer: Customer = {
    ...data,
    id: `cust_${new Date().getTime()}`,
    createdAt: new Date().toISOString(),
    archivedAt: null, // Nya kunder är aldrig arkiverade
  };
  allCustomers.push(newCustomer);
  await writeData(allCustomers);
  return newCustomer;
}

export async function updateCustomer(id: string, userId: string, data: Partial<Customer>): Promise<Customer> {
    const allCustomers = await readData();
    const index = allCustomers.findIndex(c => c.id === id && c.userId === userId);

    if (index === -1) {
        throw new Error('Customer not found or access denied.');
    }

    // Uppdatera och säkerställ att vissa fält inte kan ändras
    allCustomers[index] = { 
        ...allCustomers[index], 
        ...data,
        id: allCustomers[index].id, // Behåll original-ID
        userId: allCustomers[index].userId // Behåll original-userId
    };
    
    await writeData(allCustomers);
    return allCustomers[index];
}

export async function archiveCustomer(id: string, userId: string): Promise<void> {
    const allCustomers = await readData();
    const index = allCustomers.findIndex(c => c.id === id && c.userId === userId);

    if (index === -1) {
        throw new Error('Customer not found or access denied.');
    }

    // Markera kunden som arkiverad
    allCustomers[index].archivedAt = new Date().toISOString();
    
    await writeData(allCustomers);
}

// Funktion för att hämta ALLA kunder (inklusive arkiverade) för en användare
export async function listAllCustomersForUser(userId: string): Promise<Customer[]> {
  const allCustomers = await readData();
  return allCustomers.filter(c => c.userId === userId);
}

// NY FUNKTION: Hämta endast arkiverade kunder
export async function listArchivedCustomers(userId: string): Promise<Customer[]> {
  const allCustomers = await readData();
  return allCustomers.filter(c => c.userId === userId && c.archivedAt !== null);
}
