
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definierar vilka modalfönster som finns och vilken data de kan förvänta sig
interface ModalPayloads {
  createProject: { customerId?: string; projectName?: string };
  createCustomer: { customerName?: string };
  // Lägg till fler modaltyper här i framtiden
}

// Definierar formen på vår context
interface UIContextType {
  isModalOpen: <T extends keyof ModalPayloads>(modalId: T) => boolean;
  getModalPayload: <T extends keyof ModalPayloads>(modalId: T) => ModalPayloads[T] | undefined;
  openModal: <T extends keyof ModalPayloads>(modalId: T, payload?: ModalPayloads[T]) => void;
  closeModal: <T extends keyof ModalPayloads>(modalId: T) => void;
}

// Skapa contexten med ett default-värde
const UIContext = createContext<UIContextType | undefined>(undefined);

// Skapa en Provider-komponent
export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<Record<string, any>>({});
  const [modalPayloads, setModalPayloads] = useState<Record<string, any>>({});

  const isModalOpen = (modalId: string) => !!modalState[modalId];

  const getModalPayload = (modalId: string) => modalPayloads[modalId];

  const openModal = (modalId: string, payload?: any) => {
    setModalState(prev => ({ ...prev, [modalId]: true }));
    if (payload) {
      setModalPayloads(prev => ({ ...prev, [modalId]: payload }));
    }
  };

  const closeModal = (modalId: string) => {
    setModalState(prev => ({ ...prev, [modalId]: false }));
    // Rensa payload när modalen stängs för att undvika gammal data
    setModalPayloads(prev => ({ ...prev, [modalId]: undefined }));
  };

  const value = {
    isModalOpen,
    getModalPayload,
    openModal,
    closeModal
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

// Skapa en custom hook för att enkelt kunna använda contexten
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
