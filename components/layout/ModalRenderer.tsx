'use client';

import React from 'react';
import { useUI } from '@/contexts/UIContext';
import Modal from '@/components/shared/Modal'; // Importera den generiska Modal-komponenten

// Importera alla modaler som systemet kan använda
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import CreateAtaModal from '@/components/modals/CreateAtaModal';
import CompanyVisionModal from '@/components/modals/CompanyVisionModal';
import AddMaterialCostModal from '@/components/modals/AddMaterialCostModal';
import CreateCustomerModal from '@/components/modals/CreateCustomerModal';
import CreateOfferModal from '@/components/modals/CreateOfferModal';
import EditProjectModal from '@/components/modals/EditProjectModal';
import SetHourlyRateModal from '@/components/modals/SetHourlyRateModal';

// Mappa modal-ID:n till deras respektive komponenter och titlar
const modalRegistry: { [key: string]: { component: React.FC<any>, title: string } } = {
  createProject: { component: CreateProjectModal, title: 'Skapa Nytt Projekt' },
  createAta: { component: CreateAtaModal, title: 'Skapa ÄTA' },
  companyVision: { component: CompanyVisionModal, title: 'Företagsvision' },
  addMaterialCost: { component: AddMaterialCostModal, title: 'Lägg till Materialkostnad' },
  createCustomer: { component: CreateCustomerModal, title: 'Skapa Ny Kund' },
  createOffer: { component: CreateOfferModal, title: 'Skapa Offert' },
  editProject: { component: EditProjectModal, title: 'Redigera Projekt' },
  setHourlyRate: { component: SetHourlyRateModal, title: 'Ange Timpris' },
};

const ModalRenderer: React.FC = () => {
  const { activeModal, closeModal, modalProps } = useUI();

  const isOpen = !!activeModal;
  const modalInfo = activeModal ? modalRegistry[activeModal] : null;

  if (!isOpen || !modalInfo) {
    return null;
  }

  const ModalComponent = modalInfo.component;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={modalInfo.title}>
      <ModalComponent {...modalProps} onClose={closeModal} />
    </Modal>
  );
};

export default ModalRenderer;