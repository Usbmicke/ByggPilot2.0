
'use client';

import React, { useState } from 'react';
import { Ata } from '@/app/types';

// VÄRLDSKLASS-ARKITEKTUR: Tydligt definierade props för modalen.
interface CreateAtaModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onAtaCreated: (newAta: Ata) => void;
}

const CreateAtaModal: React.FC<CreateAtaModalProps> = ({ isOpen, onClose, projectId, onAtaCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [ataType, setAtaType] = useState<'Tillägg' | 'Avgående' | 'Ändring'>('Tillägg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/atas/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title, 
            description, 
            cost: parseFloat(cost) || 0,
            ataType 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Något gick fel på servern.');
      }

      const newAta = await response.json();
      onAtaCreated(newAta); // Skicka tillbaka den nya ÄTA:n till föräldern
      onClose(); // Stäng modalen vid framgång
      // Återställ formuläret
      setTitle('');
      setDescription('');
      setCost('');
      setAtaType('Tillägg');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Skapa ny ÄTA</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Rubrik</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Beskrivning</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            ></textarea>
          </div>
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-300 mb-1">Kostnad (SEK)</label>
            <input
              type="number"
              id="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="ataType" className="block text-sm font-medium text-gray-300 mb-1">Typ av ÄTA</label>
            <select 
              id="ataType" 
              value={ataType} 
              onChange={(e) => setAtaType(e.target.value as any)}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
                <option value="Tillägg">Tilläggsarbete</option>
                <option value="Avgående">Avgående arbete</option>
                <option value="Ändring">Ändring</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">Fel: {error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-5 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
              Avbryt
            </button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait">
              {isSubmitting ? 'Sparar...' : 'Skapa ÄTA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAtaModal;
