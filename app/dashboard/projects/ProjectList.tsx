'use client';

import { useState } from 'react';
import { useProjects } from '@/lib/hooks/useProjects'; // Importera vår nya hook
import { Project } from '@/types'; // Återanvänd den globala typen

// Funktion för att formatera valuta
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('sv-SE', { 
        style: 'currency', 
        currency: 'SEK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    }).format(value);
};

// Funktion för att mappa status till färg och text
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active': return { text: 'Aktivt', className: 'bg-green-500/20 text-green-300' };
        case 'planning': return { text: 'Planering', className: 'bg-yellow-500/20 text-yellow-300' };
        case 'completed': return { text: 'Slutfört', className: 'bg-gray-500/20 text-gray-300' };
        default: return { text: status, className: 'bg-gray-600 text-gray-200' };
    }
};

export default function ProjectList() {
  const { projects, isLoading, isError } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects?.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-700">
          <input 
            type="text"
            placeholder="Sök efter projekt eller kund..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-xs bg-gray-900 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
          />
      </div>
      
      <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                  <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Projekt</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kund</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Offertsumma</th>
                      <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Åtgärder</span>
                      </th>
                  </tr>
              </thead>
              <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                  {isLoading && (
                      <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-500">Laddar projekt...</td>
                      </tr>
                  )}
                  {isError && (
                      <tr>
                          <td colSpan={5} className="text-center py-12 text-red-400">Kunde inte ladda projekt. Försök ladda om sidan.</td>
                      </tr>
                  )}
                  {!isLoading && !isError && filteredProjects.length > 0 ? (
                      filteredProjects.map(project => {
                          const badge = getStatusBadge(project.status);
                          return (
                              <tr key={project.id} className="hover:bg-gray-700/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{project.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{project.customerName}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
                                        {badge.text}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{formatCurrency(project.totalQuote || 0)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button className="text-cyan-400 hover:text-cyan-300">Hantera</button>
                                  </td>
                              </tr>
                          );
                      })
                  ) : !isLoading && !isError && (
                      <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-500">
                              <p>Inga projekt hittades.</p>
                              <p className="text-sm mt-1">Klicka på "Skapa Nytt" och välj "Nytt Projekt" för att skapa ditt första projekt.</p>
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}
