
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as dal from '@/lib/data-access';
import logger from '@/lib/logger';

export async function updateCustomerAction(customerId: string, formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      isCompany: formData.get('isCompany') === 'on',
    };

    await dal.updateCustomer(customerId, data);
    
    revalidatePath('/customers');
    revalidatePath(`/customers/${customerId}/edit`);

  } catch (error: any) {
    logger.error({ 
        customerId,
        error: error.message, 
        stack: error.stack 
    }, '[updateCustomerAction] Failed to update customer.');

    // TBD: Return a more specific error message to the UI
  }
}

export async function archiveCustomerAction(customerId: string) {
  try {
    await dal.archiveCustomer(customerId);
    
    revalidatePath('/customers');
    redirect('/customers');

  } catch (error: any) {
      logger.error({ 
        customerId,
        error: error.message, 
        stack: error.stack 
    }, '[archiveCustomerAction] Failed to archive customer.');

    // TBD: Return a more specific error message to the UI
  }
}
