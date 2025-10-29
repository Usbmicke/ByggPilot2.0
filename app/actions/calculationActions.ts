'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { fetchCalculation as fetchCalculationFromDAL } from '@/lib/dal/calculations'; // Importerar från DAL med ett alias
import { Calculation } from '@/app/types/index';

/**
 * Server Action to fetch a calculation.
 * This action handles session validation before calling the Data Access Layer.
 * @param {string} userId - The ID of the user.
 * @param {string} calculationId - The ID of the calculation to fetch.
 * @returns {Promise<Calculation | null>}
 */
export const fetchCalculation = async (userId: string, calculationId: string): Promise<Calculation | null> => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== userId) {
    // Autentiserings- och auktoriseringskontroll
    throw new Error('Not authorized');
  }

  // Anropar DAL-funktionen för att hämta datan
  return fetchCalculationFromDAL(userId, calculationId);
};
