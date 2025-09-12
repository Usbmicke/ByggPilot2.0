
'use client';
import React from 'react';
import { demoCustomers, demoProjects } from '../data';
import { UserPlusIcon, FolderIcon, EnvelopeIcon, PhoneIcon, PlusCircleIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

// --- KUNDKORT-KOMPONENT ---
const DemoCustomerCard = ({ customer }: { customer: typeof demoCustomers[0] }) => {
  const projectsForCustomer = demoProjects.filter(p => p.customerId === customer.id);
  const activeProjects = projectsForCustomer.filter(p => p.status === 'Pågående' || p.status === 'Planerat').length;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-lg">
      <div className="p-5 border-b border-gray-700/50">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                    <BuildingOffice2Icon className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">{customer.name}</h3>
                     <p className="text-sm text-gray-400">Kund sedan {new Date(customer.createdAt).toLocaleDateString('sv-SE')}</p>
                </div>
            </div>
        </div>
      </div>
      <div className="p-5 space-y-4">
         <div className="flex items-center gap-4 text-sm">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300">{customer.email}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
            <PhoneIcon className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300">{customer.phone}</span>
        </div>
      </div>
      <div className="p-5 border-t border-gray-700/50 bg-gray-900/30 rounded-b-xl flex justify-between items-center">
        <div className="flex gap-6">
            <div>
                <div className="text-xs text-gray-400">Aktiva Projekt</div>
                <div className="text-xl font-bold text-white">{activeProjects}</div>
            </div>
            <div>
                <div className="text-xs text-gray-400">Totalt Antal Projekt</div>
                <div className="text-xl font-bold text-white">{projectsForCustomer.length}</div>
            </div>
        </div>
        <button className="bg-gray-700/50 hover:bg-cyan-600/50 text-cyan-300 font-semibold py-2 px-3 rounded-lg flex items-center gap-2 transition-colors">
            <PlusCircleIcon className="w-5 h-5"/>
            <span className="hidden sm:inline">Nytt Projekt</span>
        </button>
      </div>
    </div>
  );
};

// --- HUVUDVY FÖR DEMO-KUNDER ---
const DemoCustomersView = () => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Kunder</h1>
            <p className="text-gray-400 mt-1">En översikt av dina kundrelationer och deras projekt.</p>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
          <UserPlusIcon className="w-5 h-5" />
          Ny Kund
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {demoCustomers.map(customer => (
          <DemoCustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  );
};

export default DemoCustomersView;
