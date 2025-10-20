
import useSWR from 'swr';
import { getProjects } from '@/actions/projectActions';
import { Project } from '@/types';

// =================================================================================
// GULDSTANDARD - SWR HOOK V1.0
// Denna hook är det nya, rekommenderade sättet att hämta data i frontend-komponenter.
// Den kapslar in logiken för datahämtning, state management (laddning, fel, data) 
// och cachning, vilket gör komponenterna renare och mer effektiva.
// =================================================================================

// En enkel "fetcher"-funktion som SWR kommer att använda. 
// Den anropar vår Server Action och hanterar resultatet.
const fetcher = async (): Promise<Project[]> => {
    const { projects, error } = await getProjects();

    if (error) {
        // Om servern returnerar ett fel, kasta det så att SWR kan fånga det.
        throw new Error(error);
    }

    if (!projects) {
        // Om inga projekt returneras, kasta ett fel.
        throw new Error('Inga projekt kunde hämtas.');
    }

    return projects;
};

export function useProjects() {
    const {
        data: projects,
        error,
        isLoading,
        mutate // Funktion för att manuellt uppdatera cachen
    } = useSWR<Project[]>(
        '/api/projects', // En unik, stabil nyckel för cachning.
        fetcher,
        {
            // Konfigurera SWR att inte automatiskt försöka hämta data igen 
            // när fönstret får fokus. Detta är ofta önskvärt i företagsappar.
            revalidateOnFocus: false,
        }
    );

    return {
        projects,
        isLoading,
        isError: !!error, // Konvertera error-objektet till en boolean
        error,
        mutate, // Exponera mutate så att komponenter kan trigga en omhämtning
    };
}
