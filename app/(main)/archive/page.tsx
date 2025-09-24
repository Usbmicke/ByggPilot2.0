
'use client';

import React, { useState, useEffect } from 'react';
import { Customer, Project } from '@/app/types'; 

// Helper för att formatera datum på ett snyggt sätt
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Okänt datum';
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

export default function ArchivePage() {
  const [archivedCustomers, setArchivedCustomers] = useState<Customer[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Anropa de nya, säkra API-endpointsen parallellt
        const [customersRes, projectsRes] = await Promise.all([
          fetch('/api/archive/customers'),
          fetch('/api/archive/projects')
        ]);

        if (!customersRes.ok || !projectsRes.ok) {
          throw new Error('Kunde inte hämta all arkiverad data. Försök igen.');
        }

        const customersData = await customersRes.json();
        const projectsData = await projectsRes.json();

        setArchivedCustomers(customersData);
        setArchivedProjects(projectsData);

      } catch (err: any) {
        setError(err.message || 'Ett okänt fel inträffade.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Centraliserad komponent för att visa laddning/fel/innehåll
  const renderContent = <T extends {id: string; name: string; archivedAt: string | null; customerName?: string; email?: string}> (title: string, items: T[], type: 'customer' | 'project') => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <h2 className="text-xl font-bold text-white p-4 border-b border-gray-700">{title}</h2>
        {items.length > 0 ? (
            <ul className="divide-y divide-gray-700">
                {items.map(item => (
                    <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-800 transition-colors">
                        <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-sm text-gray-400">
                                {type === 'project' ? item.customerName : item.email}
                            </p>
                        </div>
                        <span className="text-sm text-gray-500 font-mono">
                            {formatDate(item.archivedAt)}
                        </span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-gray-400 p-4">Inga {type === 'customer' ? 'kunder' : 'projekt'} har arkiverats.</p>
        )}
    </div>
  );

  return (
    // Använder samma container-struktur som övriga sidor för ett konsekvent utseende
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Arkiv</h1>

      {loading && <p className="text-center text-gray-400">Laddar arkiv...</p>}
      {error && <p className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg">{`Fel: ${error}`}</p>}

      {!loading && !error && (
        <div className="space-y-8">
          {renderContent('Arkiverade Kunder', archivedCustomers, 'customer')}
          {renderContent('Arkiverade Projekt', archivedProjects, 'project')}
        </div>
      )}
    </div>
  );
}
