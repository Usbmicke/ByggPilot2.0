'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { firestore as db } from '@/app/lib/firebase/client';
import { useAuth } from '@/app/context/AuthContext';
import { Project } from '@/app/types/project';
import ZeroState from './ZeroState';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';

export default function ProjectDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                setProjects(projectsData);
                setIsLoading(false);
            }, (error) => {
                console.error("Fel vid hämtning av projekt:", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        }
    }, [user]);

    if (isLoading) {
        return <p>Laddar projekt...</p>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            {projects.length === 0 ? (
                <ZeroState onOpenCreateModal={() => setCreateModalOpen(true)} />
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Dina Projekt</h1>
                        <button 
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Skapa Ny Offert
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                </div>
            )}
            {isCreateModalOpen && (
                <CreateProjectModal onClose={() => setCreateModalOpen(false)} />
            )}
        </div>
    );
}
