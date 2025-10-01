
import useSWR from 'swr';
import { Project, Task, Customer, Event } from '@/app/types';

// Definierar API-svarstyper för bättre typsäkerhet
interface ProjectsApiResponse {
  projects: Project[];
}

interface CustomersApiResponse {
  customers: Customer[];
}

interface TasksApiResponse {
  tasks: Task[];
}

interface EventsApiResponse {
  events: Event[];
}

// En generisk fetcher-funktion som kan användas av SWR. 
// Den är nu korrekt typad för att hantera JSON-svar.
const fetcher = <T,>(url: string): Promise<T> => 
  fetch(url).then(res => {
    if (!res.ok) {
      // Förbättrad felhantering för att ge mer kontext
      throw new Error(`Ett fel uppstod vid datahämtning från ${url}: ${res.statusText}`);
    }
    return res.json();
  });

// Hook för att hämta projektlistan
export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<ProjectsApiResponse>('/api/projects/list', fetcher);

  return {
    projects: data?.projects,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook för att hämta kundlistan
export function useCustomers() {
  const { data, error, isLoading, mutate } = useSWR<CustomersApiResponse>('/api/customers/list', fetcher);

  return {
    customers: data?.customers,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook för att hämta uppgifter för ett specifikt projekt
export function useTasks(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<TasksApiResponse>(
    projectId ? `/api/tasks?projectId=${projectId}` : null,
    fetcher
  );

  return {
    tasks: data?.tasks,
    isLoading,
    isError: error,
    mutate,
  };
}

// Denna hook hanterar nu BARA dynamiska händelser från API:et.
export function useEvents() {
  const { data, error, isLoading, mutate } = useSWR<EventsApiResponse>('/api/events/list', fetcher);

  return {
    events: data?.events,
    isLoading,
    isError: error,
    mutate,
  };
}
