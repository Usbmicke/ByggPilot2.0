
'use client';
import React from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import CustomersView from '@/app/components/views/CustomersView';
import { demoCustomers } from '../data'; // Importerar vår påhittade data

const DemoCustomersView = () => {

    const handleCreateCustomer = () => {
        alert("DEMO: Funktionalitet för att skapa ny kund skulle köras här.");
    }

    return (
        // Vi återuppbygger en del av sid-layouten här för demon (titel och knapp)
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-white">Kunder (Demo)</h1>
                <button onClick={handleCreateCustomer} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    <UserPlusIcon className="w-5 h-5" />
                    <span>Ny Kund</span>
                </button>
            </div>

            {/* Här matar vi den återanvändbara komponenten med vår påhittade data */}
            <CustomersView customers={demoCustomers} />
        </div>
    );
};

export default DemoCustomersView;
