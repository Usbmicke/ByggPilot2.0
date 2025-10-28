
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ExclamationTriangleIcon, MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Customer } from '@/types';
import CustomersView from '@/components/views/CustomersView';
import NewCustomerModal from '@/components/NewCustomerModal'; // Importera modalen

const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // I en verklig applikation skulle detta anrop göras till en databas.
        // För nu simulerar vi ett tomt svar för att se "noll-läget".
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulera nätverksfördröjning
        const data: Customer[] = []; // Starta med en tom lista
        setCustomers(data);
      } catch (err: any) {
        setError('Kunde inte hämta kunder.');
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addCustomer = (newCustomer: Customer) => {
      setCustomers(prev => [newCustomer, ...prev]);
  }

  return { customers, isLoading, error, addCustomer };
};


export default function CustomersPage() {
  const { customers, isLoading, error, addCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // State för att styra modalen

  const filteredCustomers = useMemo(() =>
    customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.orgnr && customer.orgnr.includes(searchTerm))
    ), [customers, searchTerm]);

  return (
    <>
        {/* Lägg till modalen i DOM:en, dess synlighet styrs av `isModalOpen` */}
        <NewCustomerModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onCustomerCreated={(newCustomer) => {
                addCustomer(newCustomer);
                // Framtida idé: Visa en liten "toast"-notis om att kunden skapats
            }}
        />

        <div className="p-4 sm:p-6 md:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-white">Kunder</h1>
              <div className="flex gap-2">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Sök på namn eller orgnr..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-900/50 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-64"
                    />
                </div>
                 <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    <UserPlusIcon className="w-5 h-5" />
                    <span>Ny Kund</span>
                </button>
              </div>
            </div>

            {isLoading && <div className="p-6 text-center text-gray-400">Laddar kunder...</div>}
            
            {error && 
                <div className="p-8 text-center bg-red-900/30 border border-red-700 rounded-xl">
                    <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-red-400 mb-3"/>
                    <h3 className="text-xl font-bold text-white">Ett fel inträffade</h3>
                    <p className="text-red-300 mt-2">{error}</p>
                </div>
            }

            {!isLoading && !error && (
                <CustomersView customers={filteredCustomers} />
            )}
          </div>
        </div>
    </>
  );
}
