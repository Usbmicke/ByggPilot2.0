
'use client';

import React, { useState, useTransition } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Customer } from '@/lib/schemas/customer'; // KORREKT IMPORT

interface IdentityLookupStepProps {
    customerType: 'company' | 'private';
    onDataSelect: (data: Partial<Customer>) => void;
}

// Denna komponent hanterar både uppslag av företag och privatpersoner (framtida personnummer-lookup)
export function IdentityLookupStep({ customerType, onDataSelect }: IdentityLookupStepProps) {
    const [identifier, setIdentifier] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleLookup = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!identifier) return;

        startTransition(async () => {
            const endpoint = customerType === 'company' ? `/api/company-lookup/${identifier}` : ``; // Endpoint för privatperson kan läggas till här
            if (!endpoint) {
                setError('Funktionen är inte tillgänglig för privatpersoner än.');
                return;
            }

            try {
                const response = await fetch(endpoint);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Kunde inte hitta informationen.');
                }
                
                // Skicka tillbaka den hämtade datan till föräldern (CreateCustomerModal)
                onDataSelect(data);

            } catch (err: any) {
                setError(err.message);
            }
        });
    };

    return (
        <div className="border border-gray-700/50 p-6 rounded-lg bg-gray-900/50">
            <h3 className="text-xl font-bold text-white mb-2">
                {customerType === 'company' ? 'Sök Företag' : 'Sök Privatperson'}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
                {customerType === 'company' 
                    ? 'Ange organisationsnummer för att hämta företagsinformation automatiskt.'
                    : 'Ange personnummer för att hämta adressuppgifter.'
                }
            </p>
            
            <form onSubmit={handleLookup} className="flex items-start space-x-3">
                <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={customerType === 'company' ? 'Organisationsnummer' : 'Personnummer (YYYYMMDD-XXXX)'}
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow duration-200"
                    disabled={customerType === 'private'} // Inaktiverad för privatperson tills API finns
                />
                <button 
                    type="submit"
                    disabled={isPending || !identifier || customerType === 'private'}
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ring-offset-gray-900 transition-colors duration-200"
                >
                    {isPending ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : <MagnifyingGlassIcon className="h-5 w-5"/>}
                </button>
            </form>

            {error && <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}
             {customerType === 'private' && <div className="mt-4 text-yellow-400/80 text-sm">Funktion för att hämta privatpersoner är under utveckling.</div>}
        </div>
    );
}
