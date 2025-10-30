
'use client';

import React from 'react';
import { Customer } from '@/app/types/index';
import { IconUser, IconMail } from '@/app/constants'; // Återanvänder ikoner

interface CustomersViewProps {
  customers: Customer[];
}

// En ren "dumb component" som bara visar upp kunddata.
const CustomersView: React.FC<CustomersViewProps> = ({ customers }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="p-4 font-semibold text-white">Namn</th>
              <th className="p-4 font-semibold text-white">Kontakt</th>
              <th className="p-4 font-semibold text-white hidden md:table-cell">Telefon</th>
              <th className="p-4 font-semibold text-white hidden lg:table-cell">Skapad</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer.id} className={`border-b border-gray-700/50 ${index === customers.length - 1 ? 'border-b-0' : ''}`}>
                <td className="p-4 font-medium text-white">
                    {customer.name}
                </td>
                <td className="p-4 text-gray-300">
                    {customer.email && (
                        <a href={`mailto:${customer.email}`} className="flex items-center hover:text-cyan-400">
                            <IconMail className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                        </a>
                    )}
                </td>
                <td className="p-4 text-gray-300 hidden md:table-cell">{customer.phone}</td>
                <td className="p-4 text-gray-300 hidden lg:table-cell">
                  {new Date(customer.createdAt).toLocaleDateString('sv-SE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersView;
