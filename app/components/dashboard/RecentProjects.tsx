'use client';

import { useProjects } from '@/app/hooks/useApi';
import { FiExternalLink } from 'react-icons/fi';

export default function RecentProjects() {
    const { projects, isLoading, isError } = useProjects();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="font-bold text-xl mb-4">Senaste Projektaktivitet</h2>
            <div className="space-y-3">
                {isLoading && <p className="text-gray-500">Laddar projekt...</p>}
                {isError && <p className="text-red-500">Kunde inte ladda de senaste projekten.</p>}
                {!isLoading && !isError && (!projects || projects.length === 0) && (
                    <div className="text-center py-4 px-6 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-800">Välkommen till ByggPilot!</h3>
                        <p className="text-gray-600 mt-1">Du har inga aktiva projekt än. Klicka på "Nytt Projekt" i menyn för att komma igång och skapa ditt första projekt.</p>
                    </div>
                )}
                {projects && projects.map(project => (
                    <div key={project.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors duration-150">
                        <div>
                            <p className="font-semibold text-gray-800">{project.name}</p>
                            <p className="text-sm text-gray-500">{(project.customerName || 'Ingen kund angiven')} - <span className="capitalize">{project.status || 'Okänd'}</span></p>
                        </div>
                        <a href={`/projects/${project.id}`} className="p-2 text-gray-400 hover:text-blue-600 rounded-md transition-colors duration-150" title="Öppna projekt">
                            <FiExternalLink size={20} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
