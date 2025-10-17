
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { createActiveProject } from '@/actions/projectActions';
import { getCustomers } from '@/actions/customerActions';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

type Customer = { id: string; name: string; };

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    projectName?: string;
    customerId?: string;
  };
}

const CreateProjectModal = ({ isOpen, onClose, initialData }: CreateProjectModalProps) => {
  const { data: session } = useSession();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      if (initialData) {
        setName(initialData.projectName || '');
        setSelectedCustomerId(initialData.customerId || '');
      }

      setIsCustomerLoading(true);
      getCustomers(session.user.id)
        .then(res => {
          if (res.customers) {
            setCustomers(res.customers as Customer[]);
          }
        })
        .finally(() => setIsCustomerLoading(false));
    }
  }, [isOpen, session?.user?.id, initialData]);

  const handleClose = () => {
    setName('');
    setAddress('');
    setSelectedCustomerId('');
    setCustomers([]);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !selectedCustomerId) {
        toast.error("Du måste vara inloggad och välja en kund.");
        return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
        toast.error("Fel: Kunden kunde inte hittas.");
        return;
    }

    setIsLoading(true);
    const result = await createActiveProject({ 
        name, 
        address, 
        customerId: selectedCustomerId,
        customerName: customer.name,
    }, session.user.id);
    setIsLoading(false);

    if (result.success && result.project) {
      toast.success(`Projekt "${result.project.name}" skapades!`);
      handleClose();
    } else {
      toast.error(`Fel: ${result.error}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Skapa Nytt Projekt">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-text-secondary">Projektnamn</label>
            <input 
                type="text"
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-border-primary bg-background-primary shadow-sm p-2.5"
            />
        </div>
        <div>
            <label htmlFor="project-address" className="block text-sm font-medium text-text-secondary">Adress</label>
            <input 
                type="text"
                id="project-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-border-primary bg-background-primary shadow-sm p-2.5"
            />
        </div>
         <div>
            <label htmlFor="customer-select" className="block text-sm font-medium text-text-secondary">Välj Kund</label>
            <select
                id="customer-select"
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                required
                disabled={isCustomerLoading}
                className="mt-1 block w-full rounded-md border-border-primary bg-background-primary shadow-sm p-2.5"
            >
                <option value="" disabled>{isCustomerLoading ? 'Laddar kunder...' : 'Välj en befintlig kund'}</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Avbryt</button>
            <button type="submit" disabled={isLoading || isCustomerLoading} className="rounded-md border border-transparent bg-accent-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-blue-hover disabled:bg-gray-400">{isLoading ? 'Skapar Projekt...' : 'Spara Projekt'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
