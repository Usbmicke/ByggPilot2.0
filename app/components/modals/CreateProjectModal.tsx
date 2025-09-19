
'use client';

import React, { useState } from 'react';
import { ProjectStatus } from '@/app/types/project';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Offert');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      setError('Ange ett giltigt timpris.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          clientName,
          hourlyRate: rate,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kunde inte skapa projektet.');
      }

      onProjectCreated();
      onClose();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Skapa Nytt Projekt</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">Projektnamn</label>
            <input id="projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="t.ex. Renovering Kök" />
          </div>
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-300 mb-2">Kundnamn</label>
            <input id="clientName" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="t.ex. Kalle Anka" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-300 mb-2">Timpris (kr/tim)</label>
              <input id="hourlyRate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="850" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="Offert">Offert</option>
                <option value="Pågående">Pågående</option>
                <option value="Avslutat">Avslutat</option>
                <option value="Fakturerat">Fakturerat</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-white transition-colors">Avbryt</button>
            <button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">
              {isLoading ? 'Skapar...' : 'Skapa Projekt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
