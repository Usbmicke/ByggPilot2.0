
'use client';

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

// Denna komponent representerar huvudsidan för kundhantering.
// Den har rensats för att ta bort duplicerade element och visuella buggar.

const CustomersPage = () => {
  // TODO: Här kommer logik för att hämta och visa en lista med kunder.
  const customers = []; // Tom array som platshållare

  const handleAddNewCustomer = () => {
    // TODO: Denna funktion kommer att öppna en modal för att skapa en ny kund.
    alert('Öppnar modal för att skapa ny kund...');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-text-primary">Kunder</h1>
          <p className="mt-2 text-sm text-text-secondary">
            En lista över alla dina kunder inklusive deras namn, och projekt.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleAddNewCustomer}
            className="inline-flex items-center gap-x-2 rounded-md bg-accent-blue px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-blue-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" />
            Ny Kund
          </button>
        </div>
      </div>

      {/* Platshållare för när kundlistan är tom */}
      {customers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border-primary rounded-lg mt-8">
            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-text-primary">Inga kunder</h3>
            <p className="mt-1 text-sm text-text-secondary">Kom igång genom att skapa din första kund.</p>
        </div>
      ) : (
        // TODO: Här renderas själva listan/tabellen med kunder när det finns data.
        <div className="mt-8 flow-root">
          {/* Tabell-layout kommer här */}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
