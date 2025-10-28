
'use client';

import React from 'react';
import { useModal } from '@/app/contexts/ModalContext';

// Importera de faktiska modal-komponenterna
import CreateOfferModal from '@/app/components/modals/CreateOfferModal';
import CreateCustomerModal from '@/app/components/modals/CreateCustomerModal';
import CreateAtaModal from '@/app/components/modals/CreateAtaModal';

// En baskomponent för modalens overlay och stängningsfunktion
const ModalShell: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-background-secondary rounded-lg shadow-2xl p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};


const ModalRenderer = () => {
  const { modalType, modalProps, hideModal } = useModal();

  if (!modalType) {
    return null; // Om ingen modal ska visas, rendera ingenting
  }

  const renderModal = () => {
    switch (modalType) {
      case 'createOffer':
        return <CreateOfferModal {...modalProps} />;
      case 'createCustomer':
        return <CreateCustomerModal {...modalProps} />;
      case 'createAta':
        return <CreateAtaModal {...modalProps} />;
      default:
        return null;
    }
  };

  return <ModalShell onClose={hideModal}>{renderModal()}</ModalShell>;
};

export default ModalRenderer;
