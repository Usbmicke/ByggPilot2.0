
import 'client-only';
import useSWR, { SWRConfiguration } from 'swr';
import { runFlow } from '@genkit-ai/flow/client';
import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';

// ===================================================================
// GOLD STANDARD: fetcher-funktion för SWR
// ===================================================================
// Denna funktion körs av SWR. Den är frikopplad från Reacts livscykel.
// Den tar emot flowId (en sträng) för att undvika att serverkod
// buntas med klienten.
// ===================================================================
const flowFetcher = async <I, O>(
  flowId: string,
  input: I,
  token: string
): Promise<O> => {
  // `runFlow` här är en generisk klient-funktion. Den gör ett HTTP-anrop.
  // All serverlogik stannar på servern.
  return await runFlow<I, O>(flowId, input, {
    endpoint: '/api/genkit', // Använd alltid Genkit-proxyn
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ===================================================================
// useGenkit (Läs-operationer)
// ===================================================================
// Denna hook är designad för att hämta data (GET-liknande operationer).
// Den använder SWR för caching, revalidering och state management.
// ===================================================================
export function useGenkit<I, O>(
  flowId: string | null, // Tillåt null för att pausa anropet
  input: I,
  options?: SWRConfiguration<O>
) {
  const { user, loading: authLoading } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  // Effekt för att säkert hämta ID-token när användaren är tillgänglig.
  useEffect(() => {
    if (authLoading || !user) {
      setToken(null);
      return;
    }
    let isMounted = true;
    user.getIdToken().then((idToken) => {
      if (isMounted) {
        setToken(idToken);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Skapa SWR-nyckeln. Anropet pausas om `flowId` eller `token` är null.
  const key = flowId && token ? [flowId, input, token] : null;

  // Anropa SWR. `flowFetcher` körs endast om `key` inte är null.
  return useSWR<O>(
    key,
    ([flowId, input, token]) => flowFetcher(flowId, input, token),
    {
      shouldRetryOnError: false,
      ...options,
    }
  );
}

// ===================================================================
// useGenkitMutation (Skriv-operationer)
// ===================================================================
// Denna hook är för mutationer (POST/PUT/DELETE-liknande operationer)
// och använder inte SWR för caching. Den returnerar en `trigger`-funktion
// som kan anropas manuellt.
// ===================================================================
export function useGenkitMutation<I, O>(
  flowId: string
) {
  const { user, loading: authLoading } = useAuth();
  const [isMutating, setIsMutating] = useState(false);

  const trigger = async (input: I): Promise<O> => {
    if (authLoading) {
      throw new Error("Auth is still loading.");
    }
    if (!user) {
      throw new Error("User is not authenticated.");
    }

    setIsMutating(true);
    try {
      const token = await user.getIdToken();
      return await flowFetcher(flowId, input, token);
    } finally {
      setIsMutating(false);
    }
  };

  return {
    trigger,
    isMutating: isMutating || authLoading,
  };
}
