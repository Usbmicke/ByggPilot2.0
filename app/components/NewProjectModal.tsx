'use client';

import React, { useState } from 'react';
import { IconX } from '@/app/constants';
import { Project } from '@/app/types';

type NewProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: Project) => void;
};

export default function NewProjectModal({ isOpen, onClose, onProjectCreated }: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState<'Anbud' | 'Pågående' | 'Avslutat'>('Anbud');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!projectName || !customerName) {
      setError('Projektnamn och kundnamn får inte vara tomma.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: projectName, customerName, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Något gick fel');
      }

      const newProject = await response.json();
      onProjectCreated(newProject);
      onClose(); // Stäng modalen vid framgång
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Ett okänt fel uppstod');
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast"
         onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg relative"
           onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Skapa nytt projekt</h2>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10 p-2 rounded-full hover:bg-gray-700/50">
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
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">Kundnamn</label>
              <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
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
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Skapar...' : 'Skapa Projekt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
