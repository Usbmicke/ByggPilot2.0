
'use client';

import React, { useState, useEffect } from 'react';
import { Material } from '@/app/types/index';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface MaterialCostListProps {
  projectId: string;
  updateTrigger: number;
}

export default function MaterialCostList({ projectId, updateTrigger }: MaterialCostListProps) {
  const [materialCosts, setMaterialCosts] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterialCosts = async () => {
      try {
        setIsLoading(true);
        // Antag att din API-endpoint kan filtrera material baserat på projectId
        const response = await fetch(`/api/materials?projectId=${projectId}`);
        if (!response.ok) {
          throw new Error('Kunde inte hämta materialkostnader.');
        }
        const data = await response.json();
        setMaterialCosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchMaterialCosts();
    }
  }, [projectId, updateTrigger]);

  if (isLoading) {
    return <p className="text-gray-400">Laddar materialkostnader...</p>;
  }

  if (error) {
    return <p className="text-red-400">Fel: {error}</p>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-4">Materialkostnader</h2>
      {materialCosts.length === 0 ? (
        <div className="text-center bg-gray-800/50 rounded-lg p-8">
          <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-300">Inga materialkostnader</h3>
          <p className="mt-1 text-sm text-gray-500">Det finns inga registrerade materialkostnader för detta projekt än.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800/50 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Datum</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Benämning</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Leverantör</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-white sm:pr-6">Pris</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {materialCosts.map((cost) => (
                <tr key={cost.id} className="hover:bg-gray-700/50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-300 sm:pl-6">
                    {cost.date ? new Date(cost.date).toLocaleDateString('sv-SE') : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{cost.name}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{cost.supplier}</td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-mono text-white sm:pr-6">{cost.price.toFixed(2)} kr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
