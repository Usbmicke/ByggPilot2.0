
'use client';

import { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { PlusIcon, DocumentTextIcon, FolderPlusIcon, UserPlusIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/shared/Modal';


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
                className="inline-flex items-center gap-2 rounded-md bg-background-secondary px-4 py-2 text-sm font-semibold text-text-primary shadow-sm hover:bg-component-background border border-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
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
                            className="flex flex-col items-center justify-center p-6 bg-background-secondary rounded-lg border border-border text-text-primary hover:bg-component-background hover:border-accent transition-all duration-200 group"
                        >
                            <option.icon className="h-10 w-10 mb-3 text-text-secondary group-hover:text-accent transition-colors" />
                            <span className="font-semibold text-center">{option.name}</span>
                        </button>
                    ))}
                </div>
            </Modal>
        </>
    );
}
