
import React from 'react';
import ProjectList from '@/components/dashboard/ProjectList'; // <-- KORRIGERAD IMPORT

// =================================================================================
// PROJECTSPAGE V3.1 - Arkitektoniskt Korrekt
// =================================================================================
// Denna server-komponent är nu extremt lättviktig. Dess enda ansvar är att
// rendera sidans titel och sedan delegera all datahämtning och rendering till
// den SWR-baserade klient-komponenten `ProjectList`.

export default async function ProjectsPage() {
    return (
        <div className="animate-fadeIn space-y-6">
            <h1 className="text-3xl font-bold text-text-primary pl-1">Aktiva Projekt</h1>
            
            <ProjectList />
            
        </div>
    );
}
