
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// TYPERNA ÄR KORREKTA OCH FÖRBLIR OFÖRÄNDRADE
export type UIAction = {
  type: 'UI_ACTION';
  action: 'open_modal';
  payload: {
    modalId: string;
    [key: string]: any;
  };
};

interface UIContextType {
  activeModal: string | null;
  openModal: (modalId: string, payload?: Record<string, any>) => void;
  closeModal: () => void;
  isModalOpen: (modalId: string) => boolean;
  getModalPayload: <T>(modalId: string) => T | null; 
}

const UIContext = createContext<UIContextType | undefined>(undefined);

// REPARERAD UI-PROVIDER. ALLA BEROENDEN TILL SPECIFIKA MODALER ÄR BORTTAGNA.
export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalPayload, setModalPayload] = useState<Record<string, any> | null>(null);

  const openModal = (modalId: string, payload?: Record<string, any>) => {
    setActiveModal(modalId);
    setModalPayload(payload || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  const isModalOpen = (modalId: string) => activeModal === modalId;

  // Denna funktion är nu säker eftersom den bara läser state, den orsakar inga sidoeffekter.
  const getModalPayload = <T,>(modalId: string): T | null => {
    if (activeModal === modalId) {
        return modalPayload as T | null;
    }
    return null;
  }

  const value = { activeModal, openModal, closeModal, isModalOpen, getModalPayload };

  return (
    <UIContext.Provider value={value}>
      {children}
      {/* All renderingslogik är borttagen härifrån för att bryta den cirkulära beroendekedjan */}
    </UIContext.Provider>
  );
};

// HOOKEN ÄR KORREKT OCH FÖRBLIR OFÖRÄNDRAD
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
