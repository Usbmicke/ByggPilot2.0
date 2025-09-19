
'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '@/app/types/project';
import { ArchiveBoxIcon, TrashIcon } from '@heroicons/react/24/outline';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onProjectUpdated: () => void;
}

export default function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }: EditProjectModalProps) {
  const [projectName, setProjectName] = useState(project.projectName);
  const [clientName, setClientName] = useState(project.clientName);
  const [hourlyRate, setHourlyRate] = useState(project.hourlyRate.toString());
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProjectName(project.projectName);
    setClientName(project.clientName);
    setHourlyRate(project.hourlyRate.toString());
    setStatus(project.status);
  }, [project]);

  const handleUpdate = async (newStatus?: ProjectStatus) => {
    setIsLoading(true);
    setError(null);

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      setError('Ange ett giltigt timpris.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/projects/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          projectName,
          clientName,
          hourlyRate: rate,
          status: newStatus || status, // Use newStatus if provided (for archiving)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kunde inte uppdatera projektet.');
      }

      onProjectUpdated();
      onClose();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate();
  };
  
  const handleArchive = () => {
    handleUpdate('Arkiverat');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700">
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">Redigera Projekt</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-projectName" className="block text-sm font-medium text-gray-300 mb-2">Projektnamn</label>
            <input id="edit-projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label htmlFor="edit-clientName" className="block text-sm font-medium text-gray-300 mb-2">Kundnamn</label>
            <input id="edit-clientName" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-hourlyRate" className="block text-sm font-medium text-gray-300 mb-2">Timpris (kr/tim)</label>
              <input id="edit-hourlyRate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select id="edit-status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="Offert">Offert</option>
                <option value="Pågående">Pågående</option>
                <option value="Avslutat">Avslutat</option>
                <option value="Fakturerat">Fakturerat</option>
                <option value="Arkiverat">Arkiverat</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-between items-center pt-4">
            <button type="button" onClick={handleArchive} disabled={isLoading} className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-400 transition-colors disabled:text-gray-500">
                <ArchiveBoxIcon className="h-5 w-5" />
                <span>Arkivera Projekt</span>
            </button>
            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-white transition-colors">Avbryt</button>
                <button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">
                  {isLoading ? 'Sparar...' : 'Spara Ändringar'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
