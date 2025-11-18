
'use client';

import React from 'react';
import { useModal } from '@/app/hooks/useModal'; // Antagen korrekt sökväg till hook

// Importera alla modal-komponenter.
// Detta blir den enda platsen där vi behöver hantera modal-importer.
import { CreateOfferModal } from '@/components/modals/CreateOfferModal';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import CreateAtaModal from '@/components/modals/CreateAtaModal';
import CreateCustomerModal from '@/components/modals/CreateCustomerModal';
import SetHourlyRateModal from '@/components/modals/SetHourlyRateModal';
import CompanyVisionModal from '@/components/modals/CompanyVisionModal';

/**
 * En mappning från modal-typ (en sträng) till den faktiska React-komponenten.
 * Detta följer en skalbar och underhållsvänlig designprincip.
 */
const modalComponentMap = {
  createOffer: CreateOfferModal,
  createProject: CreateProjectModal,
  createAta: CreateAtaModal,
  createCustomer: CreateCustomerModal,
  setHourlyRate: SetHourlyRateModal,
  companyVision: CompanyVisionModal,
  // Lägg till nya modaltyper och deras komponenter här.
};

/**
 * ModalRenderer är en global komponent som renderar den aktiva modalen.
 * Den använder en mappning för att dynamiskt välja vilken modal som ska visas,
 * och renderar en standardiserad "inramning" (bakgrund, centrering).
 * Logiken styrs helt av `useModal`-hooken.
 */
const ModalRenderer: React.FC = () => {
  const { modalType, modalProps, isOpen, closeModal } = useModal();

  if (!isOpen || !modalType) {
    return null;
  }

  const ModalComponent = modalComponentMap[modalType];

  if (!ModalComponent) {
    console.error(`Modal type "${modalType}" not found in modalComponentMap.`);
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
      onClick={closeModal} // Stäng modalen vid klick på bakgrunden
    >
      <div
        onClick={(e) => e.stopPropagation()} // Förhindra att klick inuti modalen stänger den
        className="w-full max-w-lg bg-white rounded-lg shadow-xl" // Standard-styling för modal-innehåll
      >
        {/* @ts-ignore - Vi accepterar att props kan variera mellan modaler */}
        <ModalComponent {...modalProps} isOpen={isOpen} onClose={closeModal} />
      </div>
    </div>
  );
};

export default ModalRenderer;
