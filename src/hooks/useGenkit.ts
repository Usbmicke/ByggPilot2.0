'use client';

import useSWR from 'swr';
import { useAuth } from '@/components/AuthProvider'; // Denna hook kommer att ANVÄNDAS för att hämta token
import { useState, useEffect } from 'react';

// Generisk fetcher som kan hantera POST-anrop med body för mer komplexa GET-liknande flöden
const genkitFetcher = async ([url, token, input]: [string, string, any]) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: 'POST', // Använder POST för att kunna skicka med en body
    headers,
    body: JSON.stringify({ input: input || {} }), // Skicka alltid ett input-objekt
  });

  if (!response.ok) {
    let errorJson;
    try {
      errorJson = await response.json();
    } catch (e) {
      throw new Error(response.statusText);
    }
    throw new Error(errorJson.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Korrekt useGenkit-hook som INTE skapar en cirkulär referens.
 * Den är beroende av AuthProvider, men AuthProvider är INTE beroende av denna, vilket är korrekt.
 */
export function useGenkit<Output = any, Input = any>(
  flowName: string | null,
  input?: Input
) {
  const { idToken, isAuthLoading } = useAuth(); // Få token och laddningsstatus från kontexten

  // Skapa en stabil nyckel för SWR. Anropet pausas om flowName eller token saknas.
  // Inkludera input i nyckeln för att SWR ska hämta om datan när input ändras.
  const key = flowName && idToken ? [ `/api/genkit/flows/${flowName}`, idToken, input] : null;
  
  const { data, error, isLoading, mutate } = useSWR<Output>(
    key, 
    genkitFetcher, // Använd den uppdaterade fetchern
    { shouldRetryOnError: false } // Förhindra oändliga försök vid auth-fel
  );

  return {
    data,
    error,
    // Den totala laddningsstatusen är en kombination av auth-laddning och SWR-laddning
    isLoading: isAuthLoading || isLoading,
    mutate,
  };
}
