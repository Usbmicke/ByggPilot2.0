
'use client';

import React from 'react';
import { useModal } from '@/app/contexts/ModalContext';
import { CreateOfferModal } from '@/app/components/modals/CreateOfferModal';

// En mappning från modal-typ till den faktiska komponenten
const modalComponentMap = {
  createOffer: CreateOfferModal,
  // Lägg till andra modaler här
  // createCustomer: CreateCustomerModal,
  // createAta: CreateAtaModal,
};

/**
 * ModalRenderer är en centraliserad komponent som ansvarar för att rendera
 * den aktiva modalen baserat på tillståndet i ModalContext.
 * Detta är en avgörande del av arkitekturen för att hålla modal-logiken
 * frikopplad från de sidor och komponenter som öppnar dem.
 */
export default function ModalRenderer() {
  const { modalType, modalProps, hideModal } = useModal();

  if (!modalType) {
    return null; // Rendera ingenting om ingen modal ska visas
  }

  const SpecificModal = modalComponentMap[modalType];

  // Säkerhetsåtgärd om en okänd modal-typ skulle anropas
  if (!SpecificModal) {
    console.error(`Modal type "${modalType}" has no corresponding component.`);
    return null;
  }

  return <SpecificModal {...modalProps} onClose={hideModal} />;
};
