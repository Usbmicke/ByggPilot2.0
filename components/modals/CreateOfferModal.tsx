
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/shared/Modal';
import { useUI } from '@/contexts/UIContext';
import { createProspectProject } from '@/actions/projectActions';
import { getCustomers } from '@/actions/customerActions';
import { useSession } from 'next-auth/react';

type Customer = { id: string; name: string; };

const CreateOfferModal = () => {
  const { isModalOpen, closeModal } = useUI();
  const { data: session } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  useEffect(() => {
    if (isModalOpen('createOffer') && session?.user?.id) {
      setIsCustomerLoading(true);
      getCustomers(session.user.id)
        .then(res => {
          if (res.success && res.data) {
            setCustomers(res.data as Customer[]);
          }
        })
        .finally(() => setIsCustomerLoading(false));
    }
  }, [isModalOpen, session?.user?.id]);

  const handleClose = () => {
    setName('');
    setSelectedCustomerId('');
    setCustomers([]);
    closeModal('createOffer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !selectedCustomerId || !name) {
        alert("Du måste vara inloggad, ange ett projektnamn och välja en kund.");
        return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
        alert("Fel: Kunden kunde inte hittas.");
        return;
    }

    setIsLoading(true);
    const result = await createProspectProject({ 
        name,
        customerId: selectedCustomerId,
        customerName: customer.name,
    }, session.user.id);

    if (result.success && result.project) {
      alert(`Offertunderlag för "${name}" har skapats! Du skickas nu vidare till kalkylvyn.`);
      handleClose();
      // Omdirigera till kalkylsidan för det nya anbudsprojektet
      router.push(`/projects/${result.project.id}/calculations/new`);
    } else {
      alert(`Fel: ${result.error}`);
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isModalOpen('createOffer')} onClose={handleClose} title="Skapa Ny Offert">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="offer-project-name" className="block text-sm font-medium text-text-secondary">Projektnamn (för anbudet)</label>
            <input 
                type="text"
                id="offer-project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder='Ex: Fönsterbyte villa'
                className="mt-1 block w-full rounded-md border-border-primary bg-background-primary shadow-sm p-2.5"
            />
        </div>
         <div>
            <label htmlFor="offer-customer-select" className="block text-sm font-medium text-text-secondary">Välj Kund</label>
            <select
                id="offer-customer-select"
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                required
                disabled={isCustomerLoading}
                className="mt-1 block w-full rounded-md border-border-primary bg-background-primary shadow-sm p-2.5"
            >
                <option value="" disabled>{isCustomerLoading ? 'Laddar kunder...' : 'Välj en befintlig kund'}</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
             {/* TODO: Lägga till knapp för att skapa ny kund direkt härifrån */}
        </div>
        <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Avbryt</button>
            <button type="submit" disabled={isLoading || isCustomerLoading || !name || !selectedCustomerId} className="rounded-md border border-transparent bg-accent-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-blue-hover disabled:bg-gray-400">{isLoading ? 'Skapar...' : 'Fortsätt till Kalkyl'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOfferModal;
