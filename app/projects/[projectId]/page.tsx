
'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Project } from '@/app/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const ProjectDetailView = () => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const projectId = params.projectId as string;

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/projects/${projectId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to fetch project: ${response.statusText}`);
                }
                const data: Project = await response.json();
                setProject(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    if (loading) {
        return <div className="text-center text-gray-400">Laddar projekt...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Fel: {error}</div>;
    }

    if (!project) {
        return <div className="text-center text-gray-400">Kunde inte hitta projektet.</div>;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <Link href="/projects" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Tillbaka till projektlistan
                </Link>
                <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                <p className="text-gray-400">{project.customerName}</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Projektinformation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <p className="text-lg text-white font-semibold">{project.status}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400">Adress</p>
                        <p className="text-lg text-white font-semibold">{project.address || 'Ej angiven'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Senaste aktivitet</p>
                        <p className="text-lg text-white font-semibold">{project.lastActivity ? new Date(project.lastActivity).toLocaleDateString('sv-SE') : '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Skapad</p>
                        <p className="text-lg text-white font-semibold">{project.createdAt ? new Date(project.createdAt).toLocaleDateString('sv-SE') : '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Google Drive-mapp</p>
                        {project.driveFolderId ? 
                            <a href={`https://drive.google.com/drive/folders/${project.driveFolderId}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Öppna mapp</a> 
                            : <p className="text-lg text-gray-500 font-semibold">Ingen mapp skapad</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailView;
