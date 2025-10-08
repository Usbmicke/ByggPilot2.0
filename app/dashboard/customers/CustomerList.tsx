
'use client';

import { useState } from 'react';
import { useUI } from '@/contexts/UIContext';

// Typdefinitionen bör matcha den från customerActions
type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  [key: string]: any; // Tillåter andra fält
};

interface CustomerListProps {
  initialCustomers: Customer[];
}

export default function CustomerList({ initialCustomers }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const { openModal } = useUI();

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Denna funktion kan anropas när en ny kund skapas via modalen
  // för att uppdatera listan utan en full sidomladdning.
  const addCustomerToList = (newCustomer: Customer) => {
      setCustomers(prev => [newCustomer, ...prev]);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-700">
          <input 
            type="text"
            placeholder="Sök efter kund..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-xs bg-gray-900 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
          />
      </div>
      
      {/* Tabell för att visa kunderna */}
      <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                  <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Namn</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kontakt</th>
                      <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Åtgärder</span>
                      </th>
                  </tr>
              </thead>
              <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                  {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                          <tr key={customer.id} className="hover:bg-gray-700/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{customer.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{customer.email || customer.phone || 'Ingen kontaktinfo'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-cyan-400 hover:text-cyan-300">Redigera</button>
                              </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan={3} className="text-center py-12 text-gray-500">
                              <p>Inga kunder hittades.</p>
                              <p className="text-sm mt-1">Klicka på "Skapa Nytt" och välj "Ny Kund" för att lägga till din första kund.</p>
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}
