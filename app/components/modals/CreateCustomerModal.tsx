
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/shared/Modal';
import { useUI } from '@/app/context/UIContext';
import { createCustomer } from '@/app/actions/customerActions';
import { useSession } from 'next-auth/react';

const CreateCustomerModal = () => {
  const { isModalOpen, closeModal, getModalPayload } = useUI();
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const modalPayload = getModalPayload('createCustomer');

  useEffect(() => {
    if (modalPayload?.customerName) {
      setName(modalPayload.customerName);
    }
  }, [modalPayload]);

  const handleClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    closeModal('createCustomer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
        alert("Du måste vara inloggad för att skapa en kund.");
        return;
    }
    setIsLoading(true);
    const result = await createCustomer({ name, email, phone }, session.user.id);
    setIsLoading(false);

    if (result.success) {
      // TODO: Visa ett success-meddelande (toast)
      alert(`Kund "${name}" skapades!`);
      handleClose();
      // TODO: Invalidera cachen för kundlistan så den uppdateras
    } else {
      alert(`Fel: ${result.error}`);
    }
  };

  return (
    <Modal isOpen={isModalOpen('createCustomer')} onClose={handleClose} title="Skapa Ny Kund">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
            <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-text-secondary">Namn</label>
                <input 
                    type="text"
                    id="customer-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-border-primary bg-background-primary shadow-sm focus:border-accent-blue focus:ring-accent-blue sm:text-sm p-2.5"
                />
            </div>
             <div>
                <label htmlFor="customer-email" className="block text-sm font-medium text-text-secondary">E-post (valfritt)</label>
                <input 
                    type="email"
                    id="customer-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-border-primary bg-background-primary shadow-sm focus:border-accent-blue focus:ring-accent-blue sm:text-sm p-2.5"
                />
            </div>
             <div>
                <label htmlFor="customer-phone" className="block text-sm font-medium text-text-secondary">Telefon (valfritt)</label>
                <input 
                    type="tel"
                    id="customer-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-border-primary bg-background-primary shadow-sm focus:border-accent-blue focus:ring-accent-blue sm:text-sm p-2.5"
                />
            </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Avbryt</button>
            <button type="submit" disabled={isLoading} className="rounded-md border border-transparent bg-accent-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-blue-hover disabled:bg-gray-400">{isLoading ? 'Sparar...' : 'Spara Kund'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCustomerModal;
