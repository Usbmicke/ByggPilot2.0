
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // KORREKT IMPORT

interface SummaryData {
  totalProjects: number;
  ongoingProjects: number;
  invoicedValue: number;
}

interface DashboardSummaryProps {
  updateTrigger: number;
}

export default function DashboardSummary({ updateTrigger }: DashboardSummaryProps) {
  const { data: session, status } = useSession(); // Använder NextAuth:s useSession hook
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard/summary', { credentials: 'include' });
        if (!response.ok) {
          // Misslyckas tyst, logga endast i konsolen för felsökning
          console.warn(`DashboardSummary: Failed to fetch summary data. Status: ${response.status}`);
          return; 
        }
        const data = await response.json();
        setSummary(data);
      } catch (err: any) {
        console.error('DashboardSummary fetch error:', err.message); // Logga felet för felsökning
      } finally {
        setIsLoading(false);
      }
    };

    // Kör bara fetchSummary om NextAuth rapporterar att användaren är autentiserad
    if (status === 'authenticated') {
      fetchSummary();
    } else if (status === 'unauthenticated') {
      // Om användaren inte är inloggad, sluta ladda direkt.
      setIsLoading(false);
    }
    // Om status är 'loading', fortsätter isLoading att vara true, vilket är korrekt.

  }, [updateTrigger, status]); // Kör om effekten när status ändras

  // Visa en snygg laddnings-animation medan vi väntar på data
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
  
  // Om vi inte har någon data efter laddning (t.ex. vid ett tyst fel), rendera ingenting.
  if (!summary) {
      return null; 
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
