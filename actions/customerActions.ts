
'use server';

import * as dal from '@/lib/data-access';
import logger from '@/lib/logger';
import { Customer } from '@/types';

// =================================================================================
// GULDSTANDARD - ACTIONS V3.1 (DAL-IMPLEMENTERING)
// REVIDERING: All direkt databasåtkomst har tagits bort. Funktionerna anropar nu
//             Data Access Layer (DAL).
// =================================================================================

/**
 * Hämtar alla kunder för den inloggade användaren.
 */
export async function getCustomers(): Promise<{ customers?: Customer[]; error?: string; }> {
    try {
        // DAL hanterar användarverifiering.
        const customers = await dal.getCustomersForUser();
        return { customers };
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, '[customerActions] Failed to get customers.');
        return { error: 'Kunde inte hämta kunder från servern.' };
    }
}

/**
 * Skapar en ny kund.
 * @param customerData Objekt med information om den nya kunden.
 */
export async function createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ customer?: Customer; error?: string; }> {
    try {
        // DAL hanterar användarverifiering och skapande.
        const newCustomer = await dal.createCustomer(customerData);
        return { customer: newCustomer };
    } catch (error: any) {
        logger.error({ customerData, error: error.message, stack: error.stack }, '[customerActions] Failed to create customer.');
        return { error: 'Kunde inte skapa kund på servern.' };
    }
}
