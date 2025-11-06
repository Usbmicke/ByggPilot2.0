
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definierar de olika typerna av modaler vi kan visa.
// Lade till 'createOptions' för att visa valmenyn.
export type ModalType = 'createOffer' | 'createCustomer' | 'createAta' | 'createProject' | 'createOptions';

interface ModalContextType {
  openModal: (modalType: ModalType, modalProps?: any) => void;
  closeModal: () => void;
  modalType: ModalType | null;
  modalProps: any;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [modalProps, setModalProps] = useState<any>({});

  // Standardiserat till openModal/closeModal för bättre läsbarhet
  const openModal = (modalType: ModalType, modalProps: any = {}) => {
    setModalType(modalType);
    setModalProps(modalProps);
  };

  const closeModal = () => {
    setModalType(null);
    setModalProps({});
  };

  return (
    <ModalContext.Provider value={{ modalType, modalProps, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
