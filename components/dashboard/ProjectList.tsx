
'use client';

import { useProjects } from '@/lib/hooks/useProjects';
import ProjectCard from './ProjectCard';
import { Skeleton } from '@/components/ui/skeleton'; // Antag att en Skeleton-komponent finns

// =================================================================================
// GULDSTANDARD - REACT-KOMPONENT V3.0 (SWR-IMPLEMENTERING)
// REVIDERING: All manuell state-hantering (useState, useEffect) för datahämtning
//             har tagits bort. Komponenten använder nu den rena `useProjects`-hooken
//             för att hantera data, laddningsstatus och fel.
//             Detta gör komponenten betydligt enklare, mer deklarativ och robust.
// =================================================================================

const ProjectList = () => {
    const { projects, isLoading, isError, error } = useProjects();

    // 1. Hantera laddningsstatus
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Visa en serie "skelett" medan datan laddas */}
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    // 2. Hantera felstatus
    if (isError) {
        return (
            <div className="text-center text-red-500 py-10">
                <p>Ett fel inträffade vid hämtning av projekt.</p>
                <p className="text-sm text-gray-400 mt-2">{(error as Error)?.message || 'Okänt fel'}</p>
            </div>
        );
    }

    // 3. Hantera tomt tillstånd (ingen data)
    if (!projects || projects.length === 0) {
        return (
            <div className="text-center text-gray-500 py-10">
                <p>Inga projekt har skapats ännu.</p>
            </div>
        );
    }

    // 4. Rendera datan när den är tillgänglig
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
};

export default ProjectList;
