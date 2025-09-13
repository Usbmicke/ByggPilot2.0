
import useSWR from 'swr';
import { Project, Task } from '@/app/types';

// En generisk fetcher-funktion som kan användas av SWR
const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Ett fel uppstod vid datahämtning.');
    }
    return res.json();
});

// Hook för att hämta projektlistan
export function useProjects() {
    const { data, error, isLoading, mutate } = useSWR<any>('/api/projects/list', fetcher);

    return {
        projects: data?.projects as Project[],
        isLoading,
        isError: error,
        mutate
    };
}

// Hook för att hämta uppgifter för ett specifikt projekt
export function useTasks(projectId: string | null) {
    // SWR kommer inte att köra anropet om projectId är null
    const { data, error, isLoading, mutate } = useSWR<any>(projectId ? `/api/tasks?projectId=${projectId}` : null, fetcher);

    return {
        tasks: data?.tasks as Task[],
        isLoading,
        isError: error,
        mutate
    };
}

// Hook för att hämta viktiga händelser
export function useEvents() {
    const { data, error, isLoading, mutate } = useSWR<any>('/api/events/list', fetcher);

    // Platshållare - returnerar alltid det statiska tipset plus eventuella framtida händelser
    const staticTip = {
        id: 1,
        iconName: 'FiZap',
        color: 'yellow',
        title: 'Proaktivt Tips: Automatisk Riskanalys',
        description: 'Visste du att ByggPilot automatiskt skapar en initial riskanalys varje gång du skapar ett nytt projekt? Detta sparar tid och säkerställer att du omedelbart har en baslinje för KMA-arbetet.',
    };

    const events = data?.events || [];

    return {
        events: [staticTip, ...events],
        isLoading,
        isError: error,
        mutate
    };
}
