
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { getCustomers } from '@/actions/customerActions';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

type Customer = { id: string; name: string; };

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void; // Callback för att uppdatera projektlistan
  initialData?: {
    projectName?: string;
    customerId?: string;
  };
}

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated, initialData }: CreateProjectModalProps) => {
  const { data: session } = useSession();

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      // Återställ formuläret när modalen öppnas
      setProjectName(initialData?.projectName || '');
      setSelectedCustomerId(initialData?.customerId || '');
      setProjectDescription('');

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
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !selectedCustomerId) {
        toast.error("Du måste vara inloggad och välja en kund.");
        return;
    }

    setIsLoading(true);
    try {
      // 1. Hämta nästa projektnummer
      const projectNumberRes = await fetch('/api/projects/next-project-number');
      if (!projectNumberRes.ok) throw new Error('Kunde inte hämta projektnummer.');
      const { nextProjectNumber } = await projectNumberRes.json();

      // 2. Skapa projektet via API-anrop
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: `${nextProjectNumber}: ${projectName}`,
          customerId: selectedCustomerId,
          projectNumber: nextProjectNumber,
          projectDescription: projectDescription,
          startDate: new Date().toISOString().split('T')[0], // Dagens datum
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ett okänt fel inträffade.');
      }

      const result = await response.json();

      toast.success(`Projekt "${result.project.projectName}" skapades!`);
      onProjectCreated(); // Anropa callback för att uppdatera listan
      handleClose();

    } catch (error) {
      console.error('Fel vid skapande av projekt:', error);
      toast.error(`Fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Skapa Nytt Projekt">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-text-secondary">Projektnamn (exkl. projektnummer)</label>
            <input 
                type="text"
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-border-primary bg-background-primary shadow-sm p-2.5"
            />
        </div>
        <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-text-secondary">Beskrivning</label>
            <textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={3}
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
