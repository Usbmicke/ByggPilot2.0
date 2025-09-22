
'use client';

import React, { useState, useEffect } from 'react';

interface SummaryData {
  totalProjects: number;
  ongoingProjects: number;
  invoicedValue: number;
}

interface DashboardSummaryProps {
  updateTrigger: number;
}

export default function DashboardSummary({ updateTrigger }: DashboardSummaryProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard/summary', { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Kunde inte hämta summeringsdata.');
        }
        const data = await response.json();
        setSummary(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [updateTrigger]);

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
                 <div key={i} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-10 bg-gray-700 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
  }
  
  if (error) {
    return <p className="text-red-400 text-center mb-8">Fel: {error}</p>;
  }
  
  if (!summary) {
      return null; // Eller någon annan fallback-UI
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-400">Totalt antal projekt</h3>
        <p className="text-4xl font-bold text-white mt-2">{summary.totalProjects}</p>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-yellow-400">Pågående projekt</h3>
        <p className="text-4xl font-bold text-white mt-2">{summary.ongoingProjects}</p>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-green-400">Totala intäkter (Fakturerat)</h3>
        <p className="text-4xl font-bold text-white mt-2">{summary.invoicedValue.toFixed(2)} kr</p>
      </div>
    </div>
  );
}
