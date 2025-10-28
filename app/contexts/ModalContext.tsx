
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definierar de olika typerna av modaler vi kan visa
export type ModalType = 'createOffer' | 'createCustomer' | 'createAta';

interface ModalContextType {
  showModal: (modalType: ModalType, modalProps?: any) => void;
  hideModal: () => void;
  modalType: ModalType | null;
  modalProps: any;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [modalProps, setModalProps] = useState<any>({});

  const showModal = (modalType: ModalType, modalProps: any = {}) => {
    setModalType(modalType);
    setModalProps(modalProps);
  };

  const hideModal = () => {
    setModalType(null);
    setModalProps({});
  };

  return (
    <ModalContext.Provider value={{ modalType, modalProps, showModal, hideModal }}>
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
