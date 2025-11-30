
import useSWR from 'swr';
import { Flow } from '@genkit-ai/flow';
import { runFlow } from '@genkit-ai/next/client';

// Denna fetcher-funktion är en wrapper runt runFlow.
const genkitFetcher = <I, O>(flow: Flow<I, O>, input: I) => {
  return runFlow(flow, input);
};

/**
 * Custom SWR-hook för att anropa Genkit-flöden från klientsidan.
 * Hanterar datahämtning, state (loading, error) och cachning.
 * @param flow Flödesobjektet som ska köras (importerat från @/genkit/client).
 * @param input Input-data till flödet.
 */
export function useGenkit<I, O>(flow: Flow<I, O> | null, input: I) {
  // Skapa en unik nyckel för SWR baserat på flödets namn och input.
  // Om flödet är null (t.ex. vid villkorlig hämtning) blir nyckeln null, och SWR anropas inte.
  const key = flow ? [flow.name, JSON.stringify(input)] : null;

  const { data, error, isLoading, mutate } = useSWR<O>(
    key,
    () => genkitFetcher(flow!, input),
    {
      // Standard SWR-options för att undvika onödiga re-validations.
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return { data, error, isLoading, mutate };
}
