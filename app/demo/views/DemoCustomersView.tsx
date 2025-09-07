
'use client';
import React from 'react';
import CustomersPage from '@/app/dashboard/customers/page'; // Importerar den riktiga sid-layouten
import { demoCustomers } from '../data'; // Importerar vår påhittade data

const DemoCustomersView = () => {

    // I den riktiga appen hämtas datan asynkront. Här simulerar vi det genom att
    // skicka in den hårdkodade datan direkt. Vi behöver inte `useCustomers`-hooken.

    return (
        <CustomersPage 
            // Vi kan inte skicka in datan direkt till CustomersPage då den har sin egen datahämtning.
            // Vi måste skapa en anpassad version av vyn som tar emot data som props.
            // För nu skapar vi en platshållare här och bygger den nya komponenten i nästa steg.
        />
    );
};

// Temporär platshållare tills vi har en återanvändbar komponent
const TempCustomerView = () => {
    const { demoCustomers } = require('../data');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Kunder (Demo)</h1>
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg">+ Ny Kund</button>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-4 font-semibold">Namn</th>
                            <th className="p-4 font-semibold">E-post</th>
                            <th className="p-4 font-semibold">Telefon</th>
                        </tr>
                    </thead>
                    <tbody>
                        {demoCustomers.map((customer, index) => (
                            <tr key={customer.id} className={`border-b border-gray-700/50 ${index === demoCustomers.length - 1 ? 'border-b-0' : ''}`}>
                                <td className="p-4">{customer.name}</td>
                                <td className="p-4 text-gray-400">{customer.email}</td>
                                <td className="p-4 text-gray-400">{customer.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// export default DemoCustomersView;
export default TempCustomerView; // Exporterar temporär vy så länge
