
'use client';

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/client';
import { Project } from '@/types/project';
import TimeReportList from '@/components/dashboard/TimeReportList';
import ProjectEconomyDashboard from '@/components/dashboard/ProjectEconomyDashboard';
import SetHourlyRateModal from '@/components/modals/SetHourlyRateModal';
import MaterialCostList from '@/components/dashboard/MaterialCostList';
import EditProjectModal from '@/components/modals/EditProjectModal'; // IMPORTERA
import { Cog6ToothIcon } from '@heroicons/react/24/outline'; // Ikon

interface ProjectPageParams {
    params: { projectId: string };
}

export default function ProjectPage({ params }: ProjectPageParams) {
    const { projectId } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isHourlyRateModalOpen, setHourlyRateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false); // STATE FÖR REDIGERING
    const [materialUpdateTrigger, setMaterialUpdateTrigger] = useState(0);

    useEffect(() => {
        if (projectId) {
            const docRef = doc(db, 'projects', projectId as string);
            const unsubscribe = onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    const projectData = { id: doc.id, ...doc.data() } as Project;
                    setProject(projectData);
                    if (typeof projectData.hourlyRate === 'undefined') {
                        setHourlyRateModalOpen(true);
                    }
                } else {
                    console.error("Projektet hittades inte");
                    setProject(null);
                }
                setIsLoading(false);
            }, (error) => {
                console.error("Fel vid hämtning av projekt:", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        }
    }, [projectId]);
    
    const handleMaterialAdded = () => {
        setMaterialUpdateTrigger(prev => prev + 1);
    };

    const handleProjectUpdated = () => {
        // Ingen state-uppdatering behövs här eftersom onSnapshot 
        // automatiskt uppdaterar `project`-statet när datan i Firestore ändras.
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-400">Laddar projektdata...</p>
            </div>
        );
    }

    if (!project) {
        // ... (samma som tidigare)
        return (
            <div className="text-center mt-20">
                <h1 className="text-3xl font-bold text-white">Projektet kunde inte hittas</h1>
                <p className="text-gray-400 mt-2">Det ser ut som att projektet du letar efter inte finns eller har tagits bort.</p>
            </div>
        );
    }

    if (typeof project.hourlyRate === 'undefined') {
        // ... (samma som tidigare)
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="mb-8">
                    <span className="text-sm text-cyan-400">Projekt #{project.projectNumber}</span>
                    <h1 className="text-4xl font-bold text-white">{project.projectName}</h1>
                    <p className="text-xl text-gray-300">Kund: {project.clientName}</p>
                </div>
                <div className="text-center bg-gray-800 p-12 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-yellow-400">Timpris Krävs</h2>
                    <p className="text-gray-300 mt-2 mb-6">För att kunna beräkna projektets ekonomi behöver ett timpris anges.</p>
                    <button 
                        onClick={() => setHourlyRateModalOpen(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
                    >
                        Ange Timpris
                    </button>
                </div>
                <TimeReportList projectId={projectId} />
                {isHourlyRateModalOpen && (
                    <SetHourlyRateModal 
                        isOpen={isHourlyRateModalOpen}
                        onClose={() => setHourlyRateModalOpen(false)}
                        projectId={projectId}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <span className="text-sm text-cyan-400">Projekt #{project.projectNumber}</span>
                    <h1 className="text-4xl font-bold text-white">{project.projectName}</h1>
                    <p className="text-xl text-gray-300">Kund: {project.clientName}</p>
                </div>
                 <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setHourlyRateModalOpen(true)}
                        className="text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-400/50 rounded-md px-3 py-1 transition-colors"
                    >
                        Ändra timpris ({project.hourlyRate} kr/tim)
                    </button>
                    <button 
                        onClick={() => setEditModalOpen(true)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <Cog6ToothIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>

            <ProjectEconomyDashboard 
                project={project} 
                onMaterialAdded={handleMaterialAdded}
            />
            
            <MaterialCostList 
                projectId={projectId} 
                updateTrigger={materialUpdateTrigger}
            />
            
            <TimeReportList projectId={projectId} />

            {isHourlyRateModalOpen && (
                <SetHourlyRateModal 
                    isOpen={isHourlyRateModalOpen}
                    onClose={() => setHourlyRateModalOpen(false)}
                    projectId={projectId}
                />
            )}
            {project && isEditModalOpen && (
                <EditProjectModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    project={project}
                    onProjectUpdated={handleProjectUpdated}
                />
            )}
        </div>
    );
}
