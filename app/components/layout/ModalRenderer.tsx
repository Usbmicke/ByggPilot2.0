
'use client';

import React from 'react';
import { useModal } from '@/app/contexts/ModalContext';
import { CreateOfferModal } from '@/app/components/modals/CreateOfferModal';

// En mappning från modal-typ till den faktiska komponenten
const modalComponentMap = {
  createOffer: CreateOfferModal,
  // Lägg till andra modaler här
  // editProject: EditProjectModal,
  // createCustomer: CreateCustomerModal,
};

const ModalRenderer: React.FC = () => {
  const { modalType, modalProps, isOpen, closeModal } = useModal();

  if (!isOpen || !modalType) {
    return null;
  }

  const ModalComponent = modalComponentMap[modalType];

  if (!ModalComponent) {
    // Om modal-typen inte finns i mappningen, rendera inget
    // och logga ett fel för utvecklingsändamål.
    console.error(`Modal type "${modalType}" not found in modalComponentMap.`);
    return null;
  }

  // @ts-ignore
  return <ModalComponent {...modalProps} isOpen={isOpen} onClose={closeModal} />;
};

export default ModalRenderer;
