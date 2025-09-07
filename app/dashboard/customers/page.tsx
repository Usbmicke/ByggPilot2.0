
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UserGroupIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Typdefinition för en kontakt från Google
interface GoogleContact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// En enskild rad i vår kundtabell
const CustomerRow = ({ contact }: { contact: GoogleContact }) => (
  <tr className="hover:bg-gray-700/50 transition-colors">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{contact.name}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{contact.email}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{contact.phone}</td>
  </tr>
);

// Huvudkomponenten för kundvyn
export default function CustomersPage() {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Anropar det nya API:et för att hämta Google-kontakter
        const response = await fetch('/api/google/people/list-contacts');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Något gick fel vid hämtning av kontakter.');
        }
        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Filtrera kontakter baserat på söktermen
  const filteredContacts = useMemo(() =>
    contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [contacts, searchTerm]);

  return (
    <div className="p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">Kundregister (Google Contacts)</h1>
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
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg">
          <div className="overflow-x-auto">
             {isLoading ? (
                <div className="p-6 text-center text-gray-400">Laddar dina kontakter från Google...</div>
            ) : error ? (
                <div className="p-8 text-center bg-red-900/30 border border-red-700 rounded-xl">
                    <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-red-400 mb-3"/>
                    <h3 className="text-xl font-bold text-white">Kunde inte ladda kontakter</h3>
                    <p className="text-red-300 mt-2">{error}</p>
                    <p className="text-gray-400 text-sm mt-3">Det kan bero på att du inte gav ByggPilot åtkomst till dina kontakter. Prova att logga ut och in igen.</p>
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    <UserGroupIcon className="w-10 h-10 mx-auto text-gray-500 mb-3" />
                    <h3 className="text-xl font-bold text-white">Inga kontakter hittades</h3>
                    <p className="mt-2">Vi hittade inga kontakter i ditt Google-konto, eller så matchade ingen din sökning.</p>
                </div>
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
                  {filteredContacts.map((contact) => (
                    <CustomerRow key={contact.id} contact={contact} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
