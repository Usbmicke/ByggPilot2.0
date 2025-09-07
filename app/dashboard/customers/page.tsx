
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/app/types';
import NewCustomerModal from '@/app/components/NewCustomerModal';
import { IconPlus } from '@/app/constants';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/customers/list');
      if (!response.ok) {
        throw new Error('Något gick fel vid hämtning av kunder.');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCustomerCreated = (newCustomer: Customer) => {
    setCustomers(prevCustomers => [newCustomer, ...prevCustomers]);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Kundregister</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center transition-colors">
             <IconPlus className="w-5 h-5 mr-2"/>
            <span>Lägg till ny kund</span>
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg">
          <div className="overflow-x-auto">
             {isLoading ? (
                <div className="p-6 text-center text-gray-400">Laddar kunder...</div>
            ) : error ? (
                <div className="p-6 text-center text-red-400">{error}</div>
            ) : customers.length === 0 ? (
                <div className="p-6 text-center text-gray-400">Inga kunder hittades.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Namn</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">E-post</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Telefon</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <NewCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
  );
}
