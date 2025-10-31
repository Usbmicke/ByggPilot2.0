
'use client';

import React from 'react';
import { useModal } from '@/app/contexts/ModalContext';
import CreateProjectModal from './CreateProjectModal';
import CreateOptionsModal from './CreateOptionsModal';

// Denna komponent är hjärnan i modalsystemet.
// Den lyssnar på ModalContext och renderar den aktiva modalen i en överlagring.
export default function ModalRenderer() {
    const { modalType, closeModal } = useModal();

    if (!modalType) {
        return null; // Om ingen modal är aktiv, rendera ingenting
    }

    // En funktion för att rendera den specifika modalen baserat på typ
    const renderModal = () => {
        switch (modalType) {
            case 'createProject':
                return <CreateProjectModal />;
            case 'createOptions':
                return <CreateOptionsModal />;
            // TODO: Lägg till case för 'createOffer', 'createCustomer', 'createAta' när de skapas
            default:
                return null;
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
            onClick={closeModal} // Stäng modalen vid klick på bakgrunden
        >
            <div onClick={e => e.stopPropagation()} className="w-full max-w-lg">
                {renderModal()}
            </div>
        </div>
    );
}
