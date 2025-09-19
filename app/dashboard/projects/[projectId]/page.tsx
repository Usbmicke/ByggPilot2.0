'use client';

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '@/app/lib/firebase/client';
import { Project } from '@/app/types/project';
import CalculationEngine from '@/app/components/dashboard/CalculationEngine'; // IMPORTERAD

interface ProjectPageParams {
    params: { projectId: string };
}

export default function ProjectPage({ params }: ProjectPageParams) {
    const { projectId } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (projectId) {
            const docRef = doc(db, 'projects', projectId as string);
            const unsubscribe = onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    setProject({ id: doc.id, ...doc.data() } as Project);
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>Laddar projektdata...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">Projektet kunde inte hittas</h1>
                <p className="text-gray-400">Det ser ut som att projektet du letar efter inte finns eller har tagits bort.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <span className="text-sm text-cyan-400">Projekt #{project.projectNumber}</span>
                <h1 className="text-4xl font-bold text-white">{project.projectName}</h1>
                <p className="text-xl text-gray-300">Kund: {project.clientName}</p>
            </div>

            {/* Här monteras motorn in */}
            <CalculationEngine projectId={projectId} />

        </div>
    );
}
