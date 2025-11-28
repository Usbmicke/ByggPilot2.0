
import 'client-only';
import useSWR, { SWRConfiguration } from 'swr';
import { runFlow } from '@genkit-ai/flow/client';
import { useAuth } from '@/lib/auth/AuthProvider';

// ===================================================================
// GOLD STANDARD: Generic Flow Fetcher
// ===================================================================
// Denna funktion är hjärtat av data-hämtningen. Den är frikopplad
// från React och SWR, och ansvarar för att göra det faktiska
// API-anropet till Genkit-backend.
// ===================================================================

const flowFetcher = async <I, O>(
  flowId: string,
  input: I,
  token: string | null // Tillåt null, men kasta fel om det saknas
): Promise<O> => {
  if (!token) {
    throw new Error('Authentication token is missing. Cannot call flow.');
  }

  return await runFlow<I, O>(flowId, input, {
    endpoint: '/api/genkit',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


// ===================================================================
// useGenkit (för Läs-operationer / Queries)
// ===================================================================
// Använder SWR för caching, revalidering, och state management.
// Perfekt för GET-liknande operationer.
// ===================================================================

export function useGenkit<I, O>(
  flowId: string | null,
  input: I,
  options?: SWRConfiguration<O>
) {
  const { idToken, isLoading: isAuthLoading } = useAuth();

  // SWR-nyckeln bestämmer när ett anrop ska göras.
  // Om flowId är null, idToken laddas, eller idToken är null, blir nyckeln null
  // och SWR kommer inte att göra något anrop (pausat tillstånd).
  const key = flowId && !isAuthLoading && idToken ? [flowId, input, idToken] : null;

  const swrResponse = useSWR<O>(
    key,
    // fetcher-funktionen tar emot nyckeln som argument
    ([flowId, input, token]) => flowFetcher(flowId, input, token),
    {
      shouldRetryOnError: false, // Ofta bra att stänga av för API-fel
      ...options,
    }
  );

  return {
    ...swrResponse,
    // Lägg till en explicit `isLoading` som tar hänsyn till både SWRs
    // och authentiseringens laddningsstatus.
    isLoading: isAuthLoading || swrResponse.isLoading,
  };
}
