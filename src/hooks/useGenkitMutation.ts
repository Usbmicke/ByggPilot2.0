'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider'; // Importera för att hämta token

// Definiera en mer robust feltyp
interface MutationError extends Error {
  details?: any; 
}

/**
 * En ren och korrekt hook för att anropa Genkit-flöden som modifierar data (mutationer).
 * Denna hook är helt oberoende och orsakar inga cirkulära beroenden.
 */
export function useGenkitMutation<Output = any, Input = any>(
  flowName: string
) {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<MutationError | null>(null);
  const [data, setData] = useState<Output | null>(null);

  // Använd useAuth för att få tillgång till den aktuella användarens ID-token.
  const { idToken } = useAuth(); 

  const trigger = async (input: Input): Promise<Output> => {
    setIsMutating(true);
    setError(null);
    setData(null);

    if (!idToken) {
      const authError = new Error('Autentisering krävs. Användaren är inte inloggad.') as MutationError;
      setError(authError);
      setIsMutating(false);
      throw authError;
    }

    try {
      const response = await fetch(`/api/genkit/flows/${flowName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ input }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const err = new Error(result.message || 'Ett okänt fel inträffade under mutationen.') as MutationError;
        err.details = result.details;
        throw err;
      }

      setData(result);
      setIsMutating(false);
      return result;

    } catch (err: any) {
      setError(err);
      setIsMutating(false);
      // Kasta om felet så att anropande kod kan hantera det med try/catch om så önskas
      throw err;
    }
  };

  return { isMutating, error, data, trigger };
}
