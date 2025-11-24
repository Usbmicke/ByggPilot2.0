
'use client';
// GULDSTANDARD v15.0: SWR-baserad User Hook
import useSWR from 'swr';
import { UserProfile } from '@/app/_lib/schemas/user';

// En enkel fetcher-funktion som SWR kommer att använda.
// Denna funktion kan återanvändas för alla SWR-hooks.
const fetcher = async (url: string) => {
    const res = await fetch(url);
    // Om servern returnerar en statuskod som inte är lyckad (t.ex. 401, 403, 500),
    // kasta ett fel för att låta SWR veta att requesten misslyckades.
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // Bifoga extra info till felobjektet för bättre felhantering i hooken.
        (error as any).info = await res.json();
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

/**
 * Hämtar den inloggade användarens profil från /api/user/me.
 * Returnerar användardata, laddningsstatus och eventuella fel.
 * Hanterar automatiskt cache-revalidering.
 */
export function useUser() {
  // Använder nyckeln '/api/user/me'. SWR kommer automatiskt att cache-hantera baserat på denna nyckel.
  // Om användaren är utloggad kommer vår API-route returnera 401, fetchern kastar ett fel,
  // och `data` kommer att vara `undefined`, vilket är exakt det vi vill.
  const { data, error, isLoading, mutate } = useSWR<UserProfile>('/api/user/me', fetcher, {
    revalidateOnFocus: false, // Kan justeras efter behov
    shouldRetryOnError: false // Förhindrar onödiga anrop om användaren är utloggad
  });

  return {
    user: data, // Är `undefined` om man är utloggad eller vid fel
    isLoading, // `true` vid första anropet
    isError: error, // Innehåller felobjektet om fetchern kastar ett fel
    mutate, // Funktion för att manuellt tvinga en uppdatering av datan
  };
}
