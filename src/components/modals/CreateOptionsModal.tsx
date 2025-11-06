
'use client';

import React from 'react';
import { useModal } from '@/contexts/ModalContext';
import { ArrowRightIcon, BuildingStorefrontIcon, DocumentTextIcon, FolderPlusIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Enskild knapp-komponent för återanvändning
const OptionButton = ({ icon: Icon, title, description, onClick }: { icon: React.ElementType, title: string, description: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center w-full p-4 rounded-lg text-left transition-colors duration-200 bg-gray-800/50 hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
        <div className="p-3 bg-gray-900 rounded-lg mr-4">
            <Icon className="h-6 w-6 text-cyan-400" />
        </div>
        <div className="flex-grow">
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <ArrowRightIcon className="h-5 w-5 text-gray-500" />
    </button>
);

export default function CreateOptionsModal() {
    const { closeModal, openModal } = useModal();

    const handleOptionClick = (modalType: 'createProject' | 'createOffer' | 'createCustomer' | 'createAta') => {
        // Först, stäng denna modal
        closeModal();
        
        // Använd en liten fördröjning för att säkerställa en mjuk övergång mellan modals
        setTimeout(() => {
            // Öppna den relevanta, specifika modalen
            // OBS: Vi behöver definiera 'createOffer', 'createCustomer', 'createAta' i ModalContext
            // Just nu fungerar bara 'createProject'
            openModal(modalType as any); // Använder 'as any' tills vidare
        }, 150);
    };

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fadeInScale">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Vad vill du skapa?</h2>
                <button onClick={closeModal} className="p-1 text-gray-400 hover:text-white rounded-full transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="space-y-3">
                <OptionButton 
                    icon={FolderPlusIcon}
                    title="Nytt Projekt"
                    description="Starta ett nytt bygge eller renovering."
                    onClick={() => handleOptionClick('createProject')}
                />
                <OptionButton 
                    icon={DocumentTextIcon}
                    title="Ny Offert"
                    description="Skicka ett prisförslag till en kund."
                    onClick={() => console.log('Ska öppna createOffer modal')}
                />
                <OptionButton 
                    icon={UserPlusIcon}
                    title="Ny Kund"
                    description="Lägg till en ny privat- eller företagskund."
                    onClick={() => console.log('Ska öppna createCustomer modal')}
                />
                <OptionButton 
                    icon={BuildingStorefrontIcon} // Passande ikon för ÄTA
                    title="Nytt ÄTA-arbete"
                    description="Registrera ett ändrings- eller tilläggsarbete."
                    onClick={() => console.log('Ska öppna createAta modal')}
                />
            </div>
        </div>
    );
}
