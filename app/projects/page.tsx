
'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/app/types';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

// En komponent för att rendera ett enskilt projektkort
const ProjectCard = ({ project }: { project: Project }) => {
    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'Pågående': return 'bg-blue-500/20 text-blue-300';
            case 'Avslutat': return 'bg-green-500/20 text-green-300';
            case 'Planerat': return 'bg-yellow-500/20 text-yellow-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <Link href={`/projects/${project.id}`}>
            <div className="bg-gray-800/50 hover:bg-gray-700/60 transition-all duration-200 border border-gray-700 rounded-lg p-5 flex flex-col justify-between h-full shadow-lg">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-lg truncate">{project.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClasses(project.status)}`}>
                            {project.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{project.customerName}</p>
                </div>
                <div className="mt-4">
                    <p className="text-xs text-gray-500">Senaste aktivitet</p>
                    <p className="text-sm text-gray-300">{new Date(project.lastActivity).toLocaleDateString('sv-SE')}</p>
                </div>
            </div>
        </Link>
    );
};

// Huvudkomponenten för projektlistan
const ProjectsListView = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                // **FIX: Lade till credentials: 'include' för att skicka med autentiserings-cookies**
                const response = await fetch('/api/projects/list', { credentials: 'include' });
                
                if (response.status === 401) {
                    throw new Error('Obehörig. Sessionen kan ha gått ut. Prova att ladda om sidan.');
                }
                if (!response.ok) {
                    throw new Error('Något gick fel vid hämtning av projekt.');
                }
                const data: Project[] = await response.json();
                setProjects(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Mina Projekt</h1>
                    <p className="text-gray-400 mt-1">En översikt av alla dina pågående och avslutade projekt.</p>
                </div>
                <Link href="/projects/new" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
                    <PlusIcon className="w-5 h-5" />
                    Nytt Projekt
                </Link>
            </div>

            {loading && <p className="text-gray-400">Laddar projekt...</p>}
            
            {error && (
                <div className="col-span-full text-center py-12 bg-red-900/50 border border-dashed border-red-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">Ett fel uppstod</h3>
                    <p className="text-red-300 mt-1">{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length > 0 ? (
                        projects.map(p => <ProjectCard key={p.id} project={p} />)
                    ) : (
                        <div className="col-span-full text-center py-12 bg-gray-800/50 border border-dashed border-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold text-white">Du har inga projekt än.</h3>
                            <p className="text-gray-400 mt-1">Klicka på \"Nytt Projekt\" för att komma igång.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectsListView;
