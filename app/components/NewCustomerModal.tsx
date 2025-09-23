
'use client';

import React, { useState, useEffect, useCallback } from 'react';
// KORRIGERING: Importera ikoner från rätt bibliotek
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon as IconX } from '@heroicons/react/24/outline';
import { Customer } from '@/app/types';

// --- Återanvända hjälpmedel från tidigare --- 

// Typdefinition för Företags-API-svaret
interface CompanyData {
    companyName: string;
    isVatRegistered: boolean;
    hasFtax: boolean;
}

// Debounce-hook för att fördröja anrop
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// --- Huvudkomponent --- 

type NewCustomerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (newCustomer: Customer) => void;
};

export default function NewCustomerModal({ isOpen, onClose, onCustomerCreated }: NewCustomerModalProps) {
  // Befintligt state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Nytt state för organisationsnummer och verifiering
  const [orgnr, setOrgnr] = useState('');
  const [lookupState, setLookupState] = useState<{status: 'idle' | 'loading' | 'success' | 'error', message: string | null, data: CompanyData | null}>({ status: 'idle', message: null, data: null });
  const debouncedOrgnr = useDebounce(orgnr, 500); // 500ms fördröjning

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Återanvänd funktion för API-anrop
  const triggerLookup = useCallback(async (value: string) => {
    if (!value || value.length < 10) {
        setLookupState({ status: 'idle', message: null, data: null });
        return;
    }
    setLookupState({ status: 'loading', message: 'Verifierar...', data: null });
    try {
        const response = await fetch(`/api/company-lookup/${value}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Kunde inte verifiera företag.');
        setLookupState({ status: 'success', message: 'Företaget verifierat!', data });
        if (!name && data.companyName) {
            setName(data.companyName);
        }
    } catch (err: any) {
        setLookupState({ status: 'error', message: err.message, data: null });
    }
  }, [name]); // Beroende av `name` för att inte skriva över ett ifyllt namn

  useEffect(() => {
    triggerLookup(debouncedOrgnr);
  }, [debouncedOrgnr, triggerLookup]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!name || !orgnr) { // Nu är orgnr också obligatoriskt
      setError('Företagsnamn och organisationsnummer är obligatoriska.');
      setIsSubmitting(false);
      return;
    }

    try {
        // Skicka med all ny data till API:et
      const response = await fetch('/api/customers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name, 
            email, 
            phone, 
            orgnr, 
            isVerified: lookupState.status === 'success',
            hasFtax: lookupState.data?.hasFtax,
            isVatRegistered: lookupState.data?.isVatRegistered
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Något gick fel vid skapandet av kund');
      }

      const newCustomer = await response.json();
      onCustomerCreated(newCustomer);
      handleClose(); // Använd en funktion för att återställa allt
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
      // Återställ alla states vid stängning
      setName('');
      setEmail('');
      setPhone('');
      setOrgnr('');
      setError(null);
      setLookupState({ status: 'idle', message: null, data: null });
      onClose();
  }

  if (!isOpen) return null;

  // --- Renderingslogik för Verifieringsstatus ---
  const VerificationStatus = () => {
    if (lookupState.status === 'idle' && orgnr.length > 3) return <div className="mt-2 text-sm text-gray-500">Fortsätt skriva...</div>;
    if (lookupState.status === 'loading') return <div className="mt-2 text-sm text-cyan-400 animate-pulse">{lookupState.message}</div>;
    if (lookupState.status === 'error') return <div className="mt-2 text-sm text-red-400 flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5"/> {lookupState.message}</div>;
    if (lookupState.status === 'success' && lookupState.data) {
        return (
            <div className="mt-3 space-y-2 p-3 bg-gray-900/50 rounded-lg">
                <div className={`flex items-center text-sm ${lookupState.data.hasFtax ? 'text-green-400' : 'text-red-400'}`}>
                    {lookupState.data.hasFtax ? <CheckCircleIcon className="h-5 w-5 mr-2"/> : <ExclamationTriangleIcon className="h-5 w-5 mr-2"/>}
                    {lookupState.data.hasFtax ? 'Godkänd för F-skatt' : 'Varning: Ej godkänd för F-skatt'}
                </div>
                <div className={`flex items-center text-sm ${lookupState.data.isVatRegistered ? 'text-green-400' : 'text-yellow-400'}`}>
                     {lookupState.data.isVatRegistered ? <CheckCircleIcon className="h-5 w-5 mr-2"/> : <ExclamationTriangleIcon className="h-5 w-5 mr-2"/>}
                     {lookupState.data.isVatRegistered ? 'Registrerad för moms' : 'Obs: Ej registrerad för moms'}
                </div>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={handleClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Lägg till ny kund</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-gray-700/50">
            <IconX className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="orgnr" className="block text-sm font-medium text-gray-300 mb-1">Organisationsnummer</label>
              <input type="text" id="orgnr" value={orgnr} onChange={e => setOrgnr(e.target.value)} placeholder="Verifieras automatiskt..." className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <VerificationStatus />
            </div>
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">Företagsnamn</label>
              <input type="text" id="customerName" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-300 mb-1">E-postadress (för kontakt)</label>
              <input type="email" id="customerEmail" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
             <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-300 mb-1">Telefonnummer (valfritt)</label>
              <input type="tel" id="customerPhone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
            <button type="button" onClick={handleClose} className="py-2 px-4 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors">Avbryt</button>
            <button type="submit" disabled={isSubmitting || lookupState.status === 'loading'} className="py-2 px-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Sparar...' : 'Spara kund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
