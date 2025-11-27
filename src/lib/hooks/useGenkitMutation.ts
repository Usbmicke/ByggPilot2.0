'use client';
import { useState } from 'react';
import { runFlow } from '@genkit-ai/flow/client';
import { useAuth } from './useAuth';

// Typdefinition för flöden för att göra koden mer robust
interface FlowFn<I, O> {
  name: string; // Flöden identifieras med sitt namn (en sträng)
  inputSchema?: any; // Zod-schema för input (valfritt)
  outputSchema?: any; // Zod-schema för output (valfritt)
}

export function useGenkitMutation<I, O>(flow: FlowFn<I, O> | string) {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const trigger = async (input: I): Promise<O> => {
    if (!user) {
      throw new Error('User is not authenticated.');
    }

    setIsMutating(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      const flowId = typeof flow === 'string' ? flow : flow.name;
      
      const result = await runFlow(flowId, input, {
        // Peka på vår Next.js-proxy, inte direkt på Genkit-servern
        endpoint: '/api/genkit', 
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      setIsMutating(false);
      return result as O;
    } catch (err: any) {
      console.error(`[useGenkitMutation Error - ${typeof flow === 'string' ? flow : flow.name}]:`, err);
      setError(err);
      setIsMutating(false);
      throw err;
    }
  };

  return { trigger, isMutating, error };
}
