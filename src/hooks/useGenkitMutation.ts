
import { useState } from 'react';
import { Flow, runFlow } from '@genkit-ai/flow';

/**
 * Custom hook för att köra Genkit-flödesmutationer (skrivoperationer).
 * @param flow Flödesobjektet som ska köras (importerat från @/genkit/client).
 */
export function useGenkitMutation<I, O>(flow: Flow<I, O>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<O | null>(null);

  const mutate = async (input: I): Promise<O | undefined> => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await runFlow(flow, input);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
}
