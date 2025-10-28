
'use client';

import React from 'react';
import Link from 'next/link';
import { Ata } from '@/app/types'; // Antager att Ata-typen finns globalt
import { PencilIcon, CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// GULDSTANDARD-KOMPONENT: AtaList
// Denna komponent är nu extraherad för maximal återanvändbarhet.
// Den tar emot en lista med ÄTA:er och ett projectId, och renderar enbart listan.
// Detta gör att den kan användas i både AtaView och ProjectDetailView.

interface AtaListProps {
    atas: Ata[];
    projectId: string;
}

const AtaList = ({ atas, projectId }: AtaListProps) => {

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

    // Tom-tillstånd direkt i listan är en bra UX-praxis.
    if (atas.length === 0) {
        return (
            <div className="text-center py-10 px-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white">Inga ÄTA-arbeten</h3>
                <p className="text-gray-400 mt-2">Det finns inga registrerade ÄTA-arbeten för detta projekt än.</p>
            </div>
        );
    }

    return (
        <div className="border-t border-gray-700">
            <ul className="divide-y divide-gray-700">
                {atas.map(ata => (
                    <li key={ata.id}>
                        <Link href={`/projects/${projectId}/ata/${ata.id}`} className="block px-6 py-4 hover:bg-gray-700/50 transition-colors">
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
        </div>
    );
};

export default AtaList;
