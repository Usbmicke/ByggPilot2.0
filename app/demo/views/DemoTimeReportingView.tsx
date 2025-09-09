
'use client';
import React from 'react';
import { demoTimeEntries, demoProjects } from '../data'; // Importerar vår påhittade data

const DemoTimeReportingView = () => {

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Tidrapportering (Demo)</h1>
                {/* "Ny Tidrapport"-knappen skulle kunna öppna en modal i en fullständig demo */}
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg">+ Ny Tidrapport</button>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-4 font-semibold">Datum</th>
                            <th className="p-4 font-semibold">Projekt</th>
                            <th className="p-4 font-semibold hidden md:table-cell">Kund</th>
                            <th className="p-4 font-semibold text-right">Timmar</th>
                            <th className="p-4 font-semibold hidden lg:table-cell">Kommentar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {demoTimeEntries.map((entry, index) => (
                            <tr key={entry.id} className={`border-b border-gray-700/50 ${index === demoTimeEntries.length - 1 ? 'border-b-0' : ''}`}>
                                <td className="p-4 whitespace-nowrap">{entry.date}</td>
                                <td className="p-4 font-medium">{entry.projectName}</td>
                                <td className="p-4 text-gray-400 hidden md:table-cell">{entry.customerName}</td>
                                <td className="p-4 text-right font-mono">{entry.hours.toFixed(1)}</td>
                                <td className="p-4 text-gray-400 hidden lg:table-cell">{entry.comment}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DemoTimeReportingView;
