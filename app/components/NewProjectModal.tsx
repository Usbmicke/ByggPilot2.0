
'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon as IconX } from '@heroicons/react/24/outline';
import { Project, ProjectStatus } from '@/app/types';

interface GoogleContact {
  id: string;
  name: string;
}

type NewProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: Project) => void;
};

export default function NewProjectModal({ isOpen, onClose, onProjectCreated }: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.QUOTE);
  
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProjectName('');
      setSelectedCustomerId('');
      setStatus(ProjectStatus.QUOTE);
      setError(null);
      
      const fetchContacts = async () => {
        setIsLoadingContacts(true);
        try {
          // Notera: Detta API-anrop har inte verifierats än, men vi fokuserar på att skapa projektet först.
          const response = await fetch('/api/google/people/list-contacts');
          if (!response.ok) {
            throw new Error('Kunde inte hämta kundlistan från Google');
          }
          const data = await response.json();
          const sortedContacts = (data.contacts || []).sort((a: GoogleContact, b: GoogleContact) => a.name.localeCompare(b.name));
          setContacts(sortedContacts);
        } catch (err: any) {
          setError('Kunde inte ladda Google-kontakter. Är du säker på att API-nyckeln är korrekt konfigurerad?');
        }
        setIsLoadingContacts(false);
      };

      fetchContacts();
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
    
    const selectedContact = contacts.find(c => c.id === selectedCustomerId);
    if (!selectedContact) {
        setError('Den valda kunden är ogiltig.');
        setIsSubmitting(false);
        return;
    }

    try {
      // **KORRIGERING: Anropar nu den korrekta endpointen '/api/projects'**
      const response = await fetch('/api/projects', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // **KORRIGERING: Fältet heter 'name', inte 'projectName' i API:et**
          name: projectName, 
          customerId: selectedContact.id,
          customerName: selectedContact.name,
          status: status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Något gick fel vid skapandet av projektet');
      }

      const newProject: Project = await response.json();
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
              <label htmlFor="customer" className="block text-sm font-medium text-gray-300 mb-1">Välj Kund (från Google Contacts)</label>
              <select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} disabled={isLoadingContacts} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50">
                <option value="">{isLoadingContacts ? 'Laddar Google-kontakter...' : 'Välj en kund'}</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>{contact.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                {Object.values(ProjectStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-400 text-sm py-2 bg-red-900/30 rounded-lg px-3">{error}</p>}
          </div>
          <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors">Avbryt</button>
            <button type="submit" disabled={isSubmitting || isLoadingContacts} className="py-2 px-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Skapar...' : 'Skapa Projekt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
