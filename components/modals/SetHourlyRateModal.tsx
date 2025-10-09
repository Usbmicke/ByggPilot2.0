
'use client';

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase'; // Korrigerad import

interface SetHourlyRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export default function SetHourlyRateModal({ isOpen, onClose, projectId }: SetHourlyRateModalProps) {
  const [hourlyRate, setHourlyRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      setError('Ange ett giltigt timpris (ett positivt tal).');
      setIsLoading(false);
      return;
    }

    try {
      const projectRef = doc(firestore, 'projects', projectId); // Använder 'firestore'
      await updateDoc(projectRef, { hourlyRate: rate });
      onClose();
    } catch (err) {
      console.error('Fel vid uppdatering av timpris:', err);
      setError('Kunde inte spara timpriset. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Ange Timpris</h2>
        <p className="text-gray-400 mb-6">Ange det timpris (exkl. moms) som ska användas för att beräkna arbetskostnaden för detta projekt.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-300 mb-2">Timpris (kr/tim)</label>
            <input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="t.ex. 850"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-white transition-colors">
              Avbryt
            </button>
            <button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">
              {isLoading ? 'Sparar...' : 'Spara Timpris'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
