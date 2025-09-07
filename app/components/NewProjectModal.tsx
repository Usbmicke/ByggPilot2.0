
'use client';

import React, { useState, useEffect } from 'react';
import { IconX } from '@/app/constants';
import { Project, Customer } from '@/app/types';

type NewProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: Project) => void;
};

export default function NewProjectModal({ isOpen, onClose, onProjectCreated }: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [status, setStatus] = useState<'Anbud' | 'Pågående' | 'Avslutat'>('Anbud');
  
  // State för att hålla kundlistan och dess laddningsstatus
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effekt för att hämta kunder när modalen öppnas
  useEffect(() => {
    if (isOpen) {
      // Återställ formuläret varje gång modalen öppnas
      setProjectName('');
      setSelectedCustomerId('');
      setStatus('Anbud');
      setError(null);
      
      const fetchCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
          const response = await fetch('/api/customers/list');
          if (!response.ok) {
            throw new Error('Kunde inte hämta kundlistan');
          }
          const data: Customer[] = await response.json();
          setCustomers(data);
        } catch (err: any) {
          setError(err.message);
        }
        setIsLoadingCustomers(false);
      };

      fetchCustomers();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!projectName || !selectedCustomerId) {
      setError('Projektnamn och kund måste väljas.');
      setIsSubmitting(false);
      return;
    }
    
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    if (!selectedCustomer) {
        setError('Den valda kunden är ogiltig.');
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Något gick fel');
      }

      const newProject = await response.json();
      onProjectCreated(newProject);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Skapa nytt projekt</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-gray-700/50">
            <IconX className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">Projektnamn</label>
              <input type="text" id="projectName" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-300 mb-1">Välj Kund</label>
              <select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} disabled={isLoadingCustomers} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50">
                <option value="">{isLoadingCustomers ? 'Laddar kunder...' : 'Välj en kund'}</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="Anbud">Anbud</option>
                <option value="Pågående">Pågående</option>
                <option value="Avslutat">Avslutat</option>
              </select>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
          <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors">Avbryt</button>
            <button type="submit" disabled={isSubmitting || isLoadingCustomers} className="py-2 px-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Skapar...' : 'Skapa Projekt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
