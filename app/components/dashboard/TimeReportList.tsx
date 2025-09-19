
'use client';

import React, { useState, useEffect } from 'react';
import { TimeEntry } from '@/app/types/time';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface TimeReportListProps {
  projectId: string;
}

export default function TimeReportList({ projectId }: TimeReportListProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/time-entries?projectId=${projectId}`);
        if (!response.ok) {
          throw new Error('Kunde inte hämta tidrapporter.');
        }
        const data = await response.json();
        setTimeEntries(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeEntries();
  }, [projectId]);

  if (isLoading) {
    return <p className="text-gray-400">Laddar tidrapporter...</p>;
  }

  if (error) {
    return <p className="text-red-400">Fel: {error}</p>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-4">Rapporterad Tid</h2>
      {timeEntries.length === 0 ? (
        <div className="text-center bg-gray-800/50 rounded-lg p-8">
          <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-300">Inga tidrapporter</h3>
          <p className="mt-1 text-sm text-gray-500">Det finns inga rapporterade tider för detta projekt än.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800/50 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Datum</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Timmar</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Beskrivning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {timeEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-700/50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-300 sm:pl-6">
                    {new Date(entry.date).toLocaleDateString('sv-SE')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{entry.hours}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
