
import useSWR from 'swr';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';

// En generisk fetcher-funktion som använder fetch och hanterar autentisering
const genkitFetcher = async (url: string, token: string | null) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    let errorJson;
    try {
      errorJson = await response.json();
    } catch (e) {
      // Om det inte finns en JSON-kropp, använd texten
      throw new Error(response.statusText);
    }
    // Använd felmeddelandet från Genkit om det finns
    throw new Error(errorJson.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Korrekt useGenkit-hook som använder en sträng (flowName) för att undvika server-kod-import.
 *
 * @param flowName Namnet på Genkit-flödet att anropa.
 * @param input Valfri input till flödet.
 */
export function useGenkit<Output = any, Input = any>(
  flowName: string | null, // Tillåt null för att kunna inaktivera anropet
  input?: Input
) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      }
    };
    fetchToken();
  }, [user]);

  // Bygg URL. Om input finns, serialisera det som en query parameter.
  // OBS: Detta fungerar bara för GET-liknande flöden med enkel input.
  // För komplex input (POST) är useGenkitMutation ett bättre val.
  const key = flowName ? `/api/genkit/flows/${flowName}` : null;
  
  // Använd SWR-hooken med vår fetcher. Anropet pausas om flowName, user, eller token saknas.
  const { data, error, isLoading, mutate } = useSWR<Output>(
    key && !isAuthLoading && idToken ? [key, idToken] : null,
    ([url, token]) => genkitFetcher(url, token)
  );

  return {
    data,
    error,
    isLoading: (isAuthLoading || isLoading),
    mutate,
  };
}
