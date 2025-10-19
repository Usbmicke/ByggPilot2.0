import useSWR from 'swr';
import { Project } from '@/types';

// En generell "fetcher"-funktion som SWR använder.
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const errorDetails = await res.json();
        const error = new Error(errorDetails.message || 'Ett fel uppstod vid datahämtning.');
        throw error;
    }
    return res.json();
};

/**
 * Custom hook för att hämta projektlistan.
 * Hanterar datahämtning, cachning, och felhantering via SWR.
 */
export function useProjects() {
    // Notera: SWR anropar /api/projects, som i sin tur anropar DAL-funktionen getProjects.
    const { data, error, isLoading, mutate } = useSWR<Project[]>('/api/projects', fetcher);

    return {
        projects: data,
        isLoading,
        isError: error,
        mutateProjects: mutate,
    };
}
