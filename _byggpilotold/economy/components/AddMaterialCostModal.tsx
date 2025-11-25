
'use client';

import React, { useState } from 'react';

interface AddMaterialCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onMaterialAdded: () => void; // För att uppdatera listan
}

export default function AddMaterialCostModal({ isOpen, onClose, projectId, onMaterialAdded }: AddMaterialCostModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [supplier, setSupplier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const costAmount = parseFloat(amount);
    if (isNaN(costAmount) || costAmount <= 0) {
      setError('Ange en giltig kostnad (ett positivt tal).');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/materials/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId,
          date,
          description,
          amount: costAmount,
          supplier 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kunde inte spara materialkostnaden.');
      }
      
      onMaterialAdded(); // Anropa callback för att uppdatera UI
      onClose(); // Stäng modalen

    } catch (err: any) {
      console.error('Fel vid skapande av materialkostnad:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Lägg till Materialkostnad</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Beskrivning</label>
            <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="t.ex. Virke från Byggmax" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Kostnad (kr, ex. moms)</label>
              <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="1500.50" />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Inköpsdatum</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </div>

          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-300 mb-2">Leverantör (valfritt)</label>
            <input id="supplier" type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="t.ex. Hornbach" />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-white transition-colors">
              Avbryt
            </button>
            <button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">
              {isLoading ? 'Sparar...' : 'Lägg till Kostnad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
