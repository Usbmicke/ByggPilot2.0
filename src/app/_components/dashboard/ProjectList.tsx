
'use client';

import useSWR from 'swr';
import { Project } from '@/lib/dal/dal'; // <-- KORRIGERAD IMPORT
import ProjectCard from './ProjectCard';

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        const error = new Error('Kunde inte hämta data.');
        console.error('[ProjectList] Fetcher error:', res);
        throw error;
    }
    return res.json();
});

export default function ProjectList() {
    const { data: projects, error, isLoading } = useSWR<Project[]>('/api/projects', fetcher);

    if (error) {
        console.error('[ProjectList] SWR fetch error', { error });
        return <div className="text-center text-red-500 p-8"><p>Kunde inte ladda projekten.</p></div>;
    }

    if (isLoading) {
        return <div className="text-center text-text-secondary p-8"><p>Laddar projekt...</p></div>;
    }

    return (
        <>
            {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <ProjectCard 
                            key={project.projectId} 
                            project={project} 
                        />
                    ))}
                </div>
            ) : (
                <div className="h-full flex items-center justify-center bg-background-secondary rounded-xl border border-border-color p-8">
                    <p className="text-text-secondary">
                        Inga aktiva projekt hittades. Skapa ett nytt via chatten för att komma igång!
                    </p>
                </div>
            )}
        </>
    );
}
