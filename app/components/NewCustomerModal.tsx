
'use client';

import React, { useState } from 'react';
import { IconX } from '@/app/constants';
import { Customer } from '@/app/types';

type NewCustomerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (newCustomer: Customer) => void;
};

export default function NewCustomerModal({ isOpen, onClose, onCustomerCreated }: NewCustomerModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!name || !email) {
      setError('Namn och e-post är obligatoriska fält.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/customers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Något gick fel vid skapandet av kund');
      }

      const newCustomer = await response.json();
      onCustomerCreated(newCustomer);
      onClose();
      // Återställ formuläret
      setName('');
      setEmail('');
      setPhone('');
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
          <h2 className="text-2xl font-bold text-white">Lägg till ny kund</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-gray-700/50">
            <IconX className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">Fullständigt namn</label>
              <input type="text" id="customerName" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-300 mb-1">E-postadress</label>
              <input type="email" id="customerEmail" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-300 mb-1">Telefonnummer (valfritt)</label>
              <input type="tel" id="customerPhone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
          <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors">Avbryt</button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Sparar...' : 'Spara kund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
