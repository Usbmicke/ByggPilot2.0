
'use client';

import React, { useState, useEffect } from 'react';
import { Project, Ata } from '@/app/types';
import { PlusIcon } from '@heroicons/react/24/outline';
import CreateAtaModal from '@/app/components/modals/CreateAtaModal';
// ARKITEKTURKORRIGERING: Importerar den nu externa AtaList-komponenten.
import AtaList from '../ata/AtaList';

interface AtaViewProps {
  project: Project;
}

export default function AtaView({ project }: AtaViewProps) {
    const [isAtaModalOpen, setIsAtaModalOpen] = useState(false);
    const [atas, setAtas] = useState<Ata[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAtas = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/projects/${project.id}/atas/list`);
                if (!response.ok) {
                    throw new Error('Något gick fel vid hämtning av ÄTA-poster.');
                }
                const data = await response.json();
                setAtas(data.atas || []);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAtas();
    }, [project.id]);

    const handleNewAta = () => {
        setIsAtaModalOpen(true);
    };

    const handleAtaCreated = (newAta: Ata) => {
        setAtas(prevAtas => [newAta, ...prevAtas]);
    };

    return (
        <>
            <CreateAtaModal 
                isOpen={isAtaModalOpen}
                onClose={() => setIsAtaModalOpen(false)}
                projectId={project.id}
                onAtaCreated={handleAtaCreated}
            />

            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">ÄTA-hantering</h2>
                    <button 
                        onClick={handleNewAta}
                        className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Nytt ÄTA</span>
                    </button>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-16 px-6"><p className="text-gray-400">Laddar ÄTA-arbeten...</p></div>
                    ) : (
                        // Komponent-anropet förblir detsamma, men importeras nu externt.
                        <AtaList atas={atas} projectId={project.id} />
                    )}
                </div>
            </div>
        </>
    );
}
