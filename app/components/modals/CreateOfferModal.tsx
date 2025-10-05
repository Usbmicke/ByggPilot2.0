
'use client';

import React, { useState } from 'react';
import Modal from '@/components/shared/Modal';
import { useUI } from '@/contexts/UIContext';

// Denna komponent är under utveckling och kommer att innehålla logik 
// för att skapa en offert, liknande CreateProjectModal.

const CreateOfferModal = () => {
  const { isModalOpen, closeModal } = useUI();
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    closeModal('createOffer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Logik för att skapa offert kommer här
    alert('Funktionen för att skapa offerter är under utveckling.');
    setIsLoading(false);
    handleClose();
  };

  return (
    <Modal isOpen={isModalOpen('createOffer')} onClose={handleClose} title="Skapa Ny Offert">
      <div className='p-4'>
        <p className='text-center text-gray-500'>
            Denna funktion är under utveckling.
        </p>
        <p className='text-center text-gray-500 mt-2'>
            Snart kommer du kunna skapa professionella offerter med ett klick.
        </p>
         <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Stäng</button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateOfferModal;
