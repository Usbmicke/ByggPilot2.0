
'use client';

import { useState } from 'react';
import { PlusIcon, DocumentTextIcon, FolderPlusIcon, UserPlusIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/shared/Modal';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import CreateOfferModal from '@/components/modals/CreateOfferModal'; // <-- IMPORTERAD

export default function CreateNewButton() {
    const [isChoiceModalOpen, setChoiceModalOpen] = useState(false);
    const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);
    const [isCreateOfferModalOpen, setCreateOfferModalOpen] = useState(false); // <-- NYTT STATE

    const handleNewProjectClick = () => {
        setChoiceModalOpen(false);
        setCreateProjectModalOpen(true);
    };

    const handleNewOfferClick = () => { // <-- NY HANDLER
        setChoiceModalOpen(false);
        setCreateOfferModalOpen(true);
    };

    const options = [
        { name: 'Skapa Offert', icon: DocumentTextIcon, action: handleNewOfferClick }, // <-- UPPDATERAD
        { name: 'Nytt Projekt', icon: FolderPlusIcon, action: handleNewProjectClick },
        { name: 'Ny Kund', icon: UserPlusIcon, action: () => console.log('Action: New Customer') },
        { name: 'Skapa ÄTA', icon: DocumentPlusIcon, action: () => console.log('Action: Create ATA') },
    ];

    return (
        <>
            <button
                onClick={() => setChoiceModalOpen(true)}
                className="fixed bottom-24 right-8 z-50 inline-flex items-center justify-center w-16 h-16 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-transform hover:scale-105"
                aria-label="Skapa nytt"
            >
                <PlusIcon className="h-8 w-8" />
            </button>

            <Modal isOpen={isChoiceModalOpen} onClose={() => setChoiceModalOpen(false)} title="Skapa Nytt">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {options.map((option) => (
                        <button
                            key={option.name}
                            onClick={option.action}
                            className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-white hover:bg-gray-700/70 hover:border-cyan-500 transition-all duration-200 group"
                        >
                            <option.icon className="h-10 w-10 mb-3 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                            <span className="font-semibold text-center">{option.name}</span>
                        </button>
                    ))}
                </div>
            </Modal>

            <CreateProjectModal 
                isOpen={isCreateProjectModalOpen} 
                onClose={() => setCreateProjectModalOpen(false)} 
            />

            {/* Rendera CreateOfferModal när dess state är true */}
            <CreateOfferModal 
                isOpen={isCreateOfferModalOpen}
                onClose={() => setCreateOfferModalOpen(false)}
            />
        </>
    );
}
