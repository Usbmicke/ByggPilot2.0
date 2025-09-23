'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import CreateProjectModal from '@/app/components/modals/CreateProjectModal';
import CreateAtaModal from '@/app/components/modals/CreateAtaModal';
import CompanyVisionModal from '@/app/components/modals/CompanyVisionModal'; // STEG 1: Importera den nya modalen

// Typdefinition för AI-kommandon (oförändrad)
export type UIAction = {
  type: 'UI_ACTION';
  action: 'open_modal';
  payload: {
    modalId: string;
    [key: string]: any;
  };
};

// Typdefinition för kontextens värde (oförändrad)
interface UIContextType {
  openModal: (modalId: string, payload?: Record<string, any>) => void;
  closeModal: () => void;
  isModalOpen: (modalId: string) => boolean;
  modalPayload: Record<string, any> | null;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

// STEG 2: Mappa modal-ID:n till deras komponenter
const modalComponents: { [key: string]: React.FC<any> } = {
  createProject: CreateProjectModal,
  createAta: CreateAtaModal,
  companyVision: CompanyVisionModal, // Lägg till den nya modalen i mappningen
};

// Provider-komponenten, nu med renderingslogik
export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalPayload, setModalPayload] = useState<Record<string, any> | null>(null);

  const openModal = (modalId: string, payload?: Record<string, any>) => {
    if (!modalComponents[modalId]) {
      console.error(`Modal med ID "${modalId}" finns inte.`);
      return;
    }
    setActiveModal(modalId);
    setModalPayload(payload || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  const isModalOpen = (modalId: string) => activeModal === modalId;

  const value = { openModal, closeModal, isModalOpen, modalPayload };

  // Hämta den aktiva modalkomponenten för rendering
  const ActiveModalComponent = activeModal ? modalComponents[activeModal] : null;

  return (
    <UIContext.Provider value={value}>
      {children}
      {/* STEG 3: Centraliserad renderingslogik för modaler */}
      {ActiveModalComponent && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          onClick={closeModal} // Stäng modalen vid klick på bakgrunden
        >
          <div onClick={(e) => e.stopPropagation()}> {/* Förhindra att klick inuti modalen stänger den */} 
            <ActiveModalComponent />
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
};

// Custom hook (oförändrad)
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI måste användas inom en UIProvider');
  }
  return context;
};
