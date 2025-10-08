
'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { firestore as db } from '@/app/lib/firebase/client';
import { useAuth } from '@/app/context/AuthContext';
import { useTour } from '@/hooks/useTour';
import { Project } from '@/app/types/project';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import NewTimeEntryModal from '../NewTimeEntryModal';

export default function ProjectDashboard() {
    const { user } = useAuth();
    const { startTour } = useTour();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isTimeEntryModalOpen, setTimeEntryModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                setProjects(projectsData);
                setIsLoading(false);

                // Start tour for new users with no projects
                if (projectsData.length === 0 && user.metadata.creationTime === user.metadata.lastSignInTime) {
                    const tourSteps = [
                        {
                            target: '#create-new-project-button',
                            content: 'Välkommen till ByggPilot! För att komma igång, skapa ditt första projekt här.',
                        },
                    ];
                    startTour(tourSteps);
                }
            }, (error) => {
                console.error("Fel vid hämtning av projekt:", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        }
    }, [user, startTour]);

    const handleOpenTimeEntryModal = (projectId: string) => {
        setSelectedProjectId(projectId);
        setTimeEntryModalOpen(true);
    };

    const handleCloseTimeEntryModal = () => {
        setSelectedProjectId(null);
        setTimeEntryModalOpen(false);
    };

    if (isLoading) {
        return <p>Laddar projekt...</p>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            {projects.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold text-gray-400 mb-4">Du har inga aktiva projekt ännu.</h2>
                    <p className="text-gray-500 mb-8">Kom igång genom att skapa en ny offert eller ett nytt projekt.</p>
                    <button 
                        id="create-new-project-button" // ID for the tour
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
                    >
                        Skapa Ny Offert
                    </button>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Dina Projekt</h1>
                        <button 
                            id="create-new-project-button" // ID for the tour
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Skapa Ny Offert
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <ProjectCard 
                                key={project.id} 
                                project={project} 
                                onReportTime={handleOpenTimeEntryModal}
                            />
                        ))}
                    </div>
                </div>
            )}
            {isCreateModalOpen && (
                <CreateProjectModal onClose={() => setCreateModalOpen(false)} />
            )}
            {isTimeEntryModalOpen && selectedProjectId && (
                <NewTimeEntryModal 
                    isOpen={isTimeEntryModalOpen}
                    onClose={handleCloseTimeEntryModal}
                    projectId={selectedProjectId}
                />
            )}
        </div>
    );
}
