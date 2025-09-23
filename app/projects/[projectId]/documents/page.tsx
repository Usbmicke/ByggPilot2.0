'use client'; // Behövs för att hantera state och interaktivitet

import { useState, useEffect } from 'react';
import { getProject } from '@/app/services/projectService';
import { auth } from '@/app/lib/auth'; // OBS: auth() fungerar inte i 'use client'
import { useSession } from 'next-auth/react'; // Använd detta istället
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DocumentList from '@/app/components/DocumentList';
import FileUpload from '@/app/components/FileUpload';
import { Project } from '@/app/types';

interface ProjectDocumentsPageProps {
    params: {
        projectId: string;
    };
}

export default function ProjectDocumentsPage({ params }: ProjectDocumentsPageProps) {
    const { projectId } = params;
    const { data: session, status } = useSession(); // Hook för klientsidan
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState(0); // En "nyckel" för att kunna tvinga omladdning av listan

    useEffect(() => {
        const fetchProjectData = async () => {
            if (status === 'authenticated' && session?.user?.id) {
                try {
                    const projectData = await getProject(projectId, session.user.id);
                    if (!projectData) {
                        notFound();
                    } else {
                        setProject(projectData);
                    }
                } catch (error) {
                    console.error("Fel vid hämtning av projekt", error);
                    notFound();
                }
            }
             if (status === 'unauthenticated') {
                // Hantera fallet där användaren inte är inloggad
                notFound();
            }
            setLoading(false);
        };

        fetchProjectData();
    }, [projectId, session, status]);

    const handleUploadComplete = () => {
        console.log("Uppladdning klar! Uppdaterar listan...");
        setKey(prevKey => prevKey + 1); // Ändra nyckeln för att tvinga DocumentList att uppdatera sig
    };

    if (loading || !project) {
        return <p className="text-center text-gray-400 p-8">Laddar projektinformation...</p>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="mb-8">
                <Link href={`/projects/${projectId}`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    &larr; Tillbaka till projektet: {project.name}
                </Link>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">Dokumenthantering</h1>
                <p className="text-gray-400">Ladda upp och visa filer som är kopplade till projektet.</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Ladda upp nya filer</h2>
                <FileUpload projectId={projectId} onUploadComplete={handleUploadComplete} />
            </div>

             <div className="bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">Projektfiler</h2>
                </div>
                {/* DocumentList får en nyckel så vi kan tvinga den att ladda om */}
                <DocumentList projectId={projectId} key={key} />
            </div>
        </div>
    );
}
