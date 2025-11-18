
'use client';

import React from 'react';
// import { useModal } from '@/contexts/ModalContext'; // BORTTAGEN: Modal-systemet byggs om.
import { ArrowRightIcon, BuildingStorefrontIcon, DocumentTextIcon, FolderPlusIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Enskild knapp-komponent för återanvändning
const OptionButton = ({ icon: Icon, title, description, onClick, disabled }: { icon: React.ElementType, title: string, description: string, onClick: () => void, disabled?: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center w-full p-4 rounded-lg text-left transition-colors duration-200 bg-gray-800/50 hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
    // const { closeModal, openModal } = useModal(); // BORTTAGEN

    const handleOptionClick = (modalType: string) => {
        // Funktionalitet bortkopplad under ombyggnad.
        console.log(`Försöker öppna ${modalType}, men funktionen är inaktiverad.`);
    };

    const closeModal = () => {
      // Dummy-funktion
      console.log("Försöker stänga modalen, men funktionen är inaktiverad.")
    }

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fadeInScale">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Vad vill du skapa?</h2>
                <button onClick={closeModal} className="p-1 text-gray-400 hover:text-white rounded-full transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="space-y-3">
                 <div className="text-center p-4 bg-yellow-900/30 rounded-lg">
                    <p className="text-yellow-300 font-semibold">Funktionen är under ombyggnad.</p>
                    <p className="text-yellow-400 text-sm">Alla "Skapa"-funktioner är temporärt inaktiverade.</p>
                </div>
                <OptionButton 
                    icon={FolderPlusIcon}
                    title="Nytt Projekt"
                    description="Starta ett nytt bygge eller renovering."
                    onClick={() => handleOptionClick('createProject')}
                    disabled={true}
                />
                <OptionButton 
                    icon={DocumentTextIcon}
                    title="Ny Offert"
                    description="Skicka ett prisförslag till en kund."
                    onClick={() => console.log('Ska öppna createOffer modal')}
                    disabled={true}
                />
                <OptionButton 
                    icon={UserPlusIcon}
                    title="Ny Kund"
                    description="Lägg till en ny privat- eller företagskund."
                    onClick={() => console.log('Ska öppna createCustomer modal')}
                    disabled={true}
                />
                <OptionButton 
                    icon={BuildingStorefrontIcon} // Passande ikon för ÄTA
                    title="Nytt ÄTA-arbete"
                    description="Registrera ett ändrings- eller tilläggsarbete."
                    onClick={() => console.log('Ska öppna createAta modal')}
                    disabled={true}
                />
            </div>
        </div>
    );
}
