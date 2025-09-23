'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ActionSuggestions } from "@/app/components/dashboard/ActionSuggestions";
import { ProjectList } from "@/app/components/dashboard/ProjectList";
import { WelcomeHeader } from "@/app/components/dashboard/WelcomeHeader";
import type { Project } from "@/app/types/project";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            // Avbryt om sessionen inte är laddad eller om användaren inte är autentiserad
            if (status !== 'authenticated') return;

            setIsLoading(true);
            try {
                const response = await fetch('/api/projects');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Kunde inte hämta projekt');
                }
                const data: Project[] = await response.json();
                setProjects(data);
            } catch (err: any) {
                console.error("Fel vid hämtning av projekt:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [status]); // Kör effekten när autentiseringsstatusen ändras

    // Visa laddningsindikator medan sessionen verifieras
    if (status === 'loading') {
        return <div className="text-center p-8 text-gray-400">Laddar session...</div>;
    }

    return (
        <div className="space-y-12">
            <WelcomeHeader />
            
            <section aria-labelledby="action-suggestions-heading">
                <h2 id="action-suggestions-heading" className="text-2xl font-bold tracking-tight text-white mb-6">Dina föreslagna åtgärder</h2>
                <ActionSuggestions />
            </section>

            <section aria-labelledby="project-list-heading">
                <h2 id="project-list-heading" className="text-2xl font-bold tracking-tight text-white mb-6">Dina projekt</h2>
                {error && <p className="text-red-400 bg-red-900/20 p-4 rounded-md">Kunde inte ladda projekt: {error}</p>}
                <ProjectList projects={projects} isLoading={isLoading} />
            </section>
        </div>
    );
}
