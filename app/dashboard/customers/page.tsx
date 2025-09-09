
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ExclamationTriangleIcon, MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Customer } from '@/app/types'; // Använder vår standardtyp
import CustomersView from '@/app/components/views/CustomersView'; // Importerar den nya vyn

// Denna hook hanterar logiken för att hämta och hantera kunddata.
// OBS: Denna är en förenklad version för detta exempel. I en riktig app
// skulle den kanske använda React Query eller SWR.
const useCustomers = (initialCustomers?: Customer[]) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers || []);
  const [isLoading, setIsLoading] = useState(!initialCustomers);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCustomers) return;

    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Antag att vi har ett API-endpoint för att hämta kunder
        const response = await fetch('/api/customers'); // Detta är ett hypotetiskt anrop
        if (!response.ok) {
          throw new Error('Kunde inte hämta kunder.');
        }
        const data = await response.json();
        setCustomers(data.customers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [initialCustomers]);

  return { customers, isLoading, error };
};


// Detta är "Container" eller "Page" komponenten.
// Dess ansvar är datahämtning, state management och att rendera UI-delar.
export default function CustomersPage({ initialCustomers }: { initialCustomers?: Customer[] }) {
  const { customers, isLoading, error } = useCustomers(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() =>
    customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [customers, searchTerm]);

  const handleCreateCustomer = () => {
      alert("Funktionalitet för att skapa ny kund är inte implementerad än.");
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Sidhuvud med titel, sökfält och knapp */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">Kunder</h1>
          <div className="flex gap-2">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Sök kunder..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-900/50 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-64"
                />
            </div>
             <button onClick={handleCreateCustomer} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                <UserPlusIcon className="w-5 h-5" />
                <span>Ny Kund</span>
            </button>
          </div>
        </div>

        {/* Hantering av olika states: laddning, fel, eller tom data */}
        {isLoading && <div className="p-6 text-center text-gray-400">Laddar kunder...</div>}
        
        {error && 
            <div className="p-8 text-center bg-red-900/30 border border-red-700 rounded-xl">
                <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-red-400 mb-3"/>
                <h3 className="text-xl font-bold text-white">Kunde inte ladda kunder</h3>
                <p className="text-red-300 mt-2">{error}</p>
            </div>
        }

        {/* Renderar den återanvändbara vyn när vi har data */}
        {!isLoading && !error && (
            <CustomersView customers={filteredCustomers} />
        )}
      </div>
    </div>
  );
}
