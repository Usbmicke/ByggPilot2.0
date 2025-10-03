
'use client';

import React from 'react';
import { useUI } from '@/app/contexts/UIContext';

// Importera alla modaler som systemet kan använda
import CreateProjectModal from '@/app/components/modals/CreateProjectModal';
import CreateAtaModal from '@/app/components/modals/CreateAtaModal';
import CompanyVisionModal from '@/app/components/modals/CompanyVisionModal';
import AddMaterialCostModal from '@/app/components/modals/AddMaterialCostModal';
import CreateCustomerModal from '@/app/components/modals/CreateCustomerModal';
import CreateOfferModal from '@/app/components/modals/CreateOfferModal';
import EditProjectModal from '@/app/components/modals/EditProjectModal';
import SetHourlyRateModal from '@/app/components/modals/SetHourlyRateModal';

// Mappa modal-ID:n till deras respektive komponenter
const modalRegistry: { [key: string]: React.FC<any> } = {
  createProject: CreateProjectModal,
  createAta: CreateAtaModal,
  companyVision: CompanyVisionModal,
  addMaterialCost: AddMaterialCostModal,
  createCustomer: CreateCustomerModal,
  createOffer: CreateOfferModal,
  editProject: EditProjectModal,
  setHourlyRate: SetHourlyRateModal,
};

const ModalRenderer: React.FC = () => {
  const { activeModal, closeModal } = useUI();

  if (!activeModal) {
    return null; // Om ingen modal är aktiv, rendera ingenting
  }

  const ModalComponent = modalRegistry[activeModal];

  if (!ModalComponent) {
    console.warn(`ModalRenderer: Ingen komponent registrerad för modalId "${activeModal}"`);
    return null;
  }

  return (
    // Bakgrunds-overlay som stänger modalen vid klick
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={closeModal}
    >
      {/* Wrapper för att förhindra att klick inuti modalen stänger den */}
      <div onClick={(e) => e.stopPropagation()}>
        <ModalComponent />
      </div>
    </div>
  );
};

export default ModalRenderer;
