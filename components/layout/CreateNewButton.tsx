'use client';

import { useState } from 'react';
import { useUI } from '@/contexts/UIContext'; // KORRIGERAD SÖKVÄG TILL CENTRAL CONTEXT
import { PlusIcon, DocumentTextIcon, FolderPlusIcon, UserPlusIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/shared/Modal';

// =================================================================================
// CREATE NEW BUTTON V2.0 - PLATINUM STANDARD (KORREKT CONTEXT-IMPORT)
//
// REVIDERING: Import-sökvägen för `useUI` har korrigerats till att peka på den
// centraliserade `UIContext`-filen. Detta löser den fatala kraschen "useUI must
// be used within a UIProvider" genom att säkerställa att komponenten använder
// samma context-instans som resten av applikationen.
// =================================================================================

export default function CreateNewButton() {
    const [isChoiceModalOpen, setChoiceModalOpen] = useState(false);
    const { openModal } = useUI();

    const handleOptionClick = (modalId: string) => {
        setChoiceModalOpen(false);
        openModal(modalId);
    };

    const options = [
        { name: 'Skapa Offert', icon: DocumentTextIcon, modalId: 'createOffer' },
        { name: 'Nytt Projekt', icon: FolderPlusIcon, modalId: 'createProject' },
        { name: 'Ny Kund', icon: UserPlusIcon, modalId: 'createCustomer' },
        { name: 'Skapa ÄTA', icon: DocumentPlusIcon, modalId: 'createAta' },
    ];

    return (
        <>
            <button
                onClick={() => setChoiceModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
                aria-label="Skapa nytt"
            >
                <PlusIcon className="h-5 w-5" />
                <span>Skapa nytt</span>
            </button>

            <Modal isOpen={isChoiceModalOpen} onClose={() => setChoiceModalOpen(false)} title="Skapa Nytt">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {options.map((option) => (
                        <button
                            key={option.name}
                            onClick={() => handleOptionClick(option.modalId)}
                            className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-white hover:bg-gray-700/70 hover:border-cyan-500 transition-all duration-200 group"
                        >
                            <option.icon className="h-10 w-10 mb-3 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                            <span className="font-semibold text-center">{option.name}</span>
                        </button>
                    ))}
                </div>
            </Modal>
        </>
    );
}
