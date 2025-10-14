'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project, Ata } from '@/types';
import { PlusIcon, PencilIcon, CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CreateAtaModal from '@/components/modals/CreateAtaModal';

interface AtaViewProps {
  project: Project;
  initialAtas?: Ata[];
}

const AtaList = ({ atas, projectId }: { atas: Ata[], projectId: string }) => {
    const getStatusChip = (status: Ata['status']) => {
        switch (status) {
            case 'DRAFT':
                return <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-400"><PencilIcon className="h-3.5 w-3.5"/> UTKAST</div>;
            case 'SENT':
                return <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400">SKICKAD</div>;
            case 'APPROVED':
                return <div className="flex items-center gap-1.5 text-xs font-medium text-green-400"><CheckCircleIcon className="h-3.5 w-3.5"/> GODKÄND</div>;
            default:
                return null;
        }
    };

    return (
        <ul className="divide-y divide-gray-700">
            {atas.map(ata => (
                <li key={ata.id}>
                    <Link href={`/projects/${project.id}/ata/${ata.id}`} className="block px-6 py-4 hover:bg-gray-700/50 transition-colors">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-white">{ata.title || 'Namnlöst utkast'}</p>
                                <p className="text-sm text-gray-400 truncate max-w-md">{ata.notes || 'Inga anteckningar'}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {getStatusChip(ata.status)}
                                <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                            </div>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default function AtaView({ project, initialAtas = [] }: AtaViewProps) {
    const [isAtaModalOpen, setIsAtaModalOpen] = useState(false);
    const [atas, setAtas] = useState<Ata[]>(initialAtas);

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
                    {atas.length === 0 ? (
                         <div className="text-center py-16 px-6">
                            <h3 className="text-lg font-semibold text-white">Inga ÄTA-arbeten</h3>
                            <p className="text-gray-400 mt-2">Klicka på 'Nytt ÄTA' för att registrera ett ändrings-, tilläggs- eller avvikelsearbete.</p>
                        </div>
                    ) : (
                        <AtaList atas={atas} projectId={project.id} />
                    )}
                </div>
            </div>
        </>
    );
}
