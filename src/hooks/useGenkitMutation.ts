
import useSWRMutation from 'swr/mutation';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';

// Argument-typen för vår nya trigger-funktion
interface MutationArg<Input> {
  arg: Input;
}

// Vår muterare som använder fetch för POST-anrop
async function mutationFetcher<Input>(
  url: string,
  { arg }: MutationArg<Input>,
  idToken: string | null
) {

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (!idToken) {
      throw new Error('User is not authenticated.');
  }

  headers['Authorization'] = `Bearer ${idToken}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: arg }), // Genkit förväntar sig { "data": ... }
  });

  if (!res.ok) {
    let errorJson;
    try {
        errorJson = await res.json();
    } catch (e) {
        throw new Error(res.statusText);
    }
    throw new Error(errorJson.message || 'Mutation failed');
  }

  return res.json();
}

/**
 * Hook för att köra Genkit-mutationer (POST-requests).
 *
 * @param flowName Namnet på Genkit-flödet att anropa.
 */
export function useGenkitMutation<Output = any, Input = any>(flowName: string) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken);
    }
  }, [user]);
  
  const { trigger, isMutating, error, data, reset } = useSWRMutation<Output, any, string, Input>(
    `/api/genkit/flows/${flowName}`,
    (url, { arg }) => mutationFetcher(url, { arg }, idToken),
  );

  return {
    isPending: isMutating || (!!flowName && !idToken && !isAuthLoading),
    mutate: trigger,
    error,
    data,
    reset,
  };
}
