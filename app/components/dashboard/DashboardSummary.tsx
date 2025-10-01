
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { getProjects } from '@/app/actions/projectActions';
import { Project } from '@/app/types/project';

// GULDSTANDARD: Interface för den dynamiskt hämtade datan
interface SummaryData {
  ongoingProjects: number;
  completedProjects: number;
  invoicedValue: number; // TODO: Denna ska beräknas dynamiskt i nästa steg
}

// Guldstandard-komponent för ett enskilt KPI-kort (oförändrad)
const StatCard: React.FC<{ title: string; value: string; change: number; changeType: 'percent' | 'absolute' | 'none'; changeText?: string; icon: React.ReactNode }> = ({ title, value, change, changeType, changeText, icon }) => {
  const isPositive = change >= 0;
  const ChangeIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;
  
  let changeString = '';
  if (changeType === 'percent') {
    changeString = `${Math.abs(change)}%`;
  } else if (changeType === 'absolute') {
    changeString = `${isPositive ? '+' : ''}${change}`;
  } 

  return (
    <div className="flex items-center gap-4 p-4 bg-background-tertiary rounded-lg border border-border-primary">
        <div className="flex-shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-text-secondary truncate">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
             {changeType !== 'none' && (
                <div className={`flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    <ChangeIcon className="h-3 w-3 mr-1" />
                    <strong>{changeString}</strong>
                    {changeText && <span className="text-text-secondary ml-1">{changeText}</span>}
                </div>
            )}
        </div>
    </div>
  );
};

// Enkel laddningskomponent för bättre användarupplevelse
const LoadingSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-24 bg-background-tertiary rounded-lg animate-pulse"></div>
        <div className="h-24 bg-background-tertiary rounded-lg animate-pulse"></div>
        <div className="h-24 bg-background-tertiary rounded-lg animate-pulse"></div>
    </div>
);

export default function DashboardSummary() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const projectResult = await getProjects();

        if (projectResult.success && projectResult.data) {
          const projects: Project[] = projectResult.data;
          
          // Beräkna KPIer från projektdata
          const ongoing = projects.filter(p => p.status === 'active').length;
          const completed = projects.filter(p => p.status === 'completed').length;
          
          // TODO: Implementera dynamisk hämtning av fakturerat värde.
          // För nu behåller vi en statisk siffra som placeholder.
          const tempInvoicedValue = 125350;

          setSummary({
            ongoingProjects: ongoing,
            completedProjects: completed,
            invoicedValue: tempInvoicedValue,
          });
        } else {
          console.error('Kunde inte hämta projektdata:', projectResult.error);
          setSummary(null); // Sätt till null vid fel
        }
      } catch (error) {
        console.error('Oväntat fel vid hämtning av summeringsdata:', error);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!summary) {
    return <div className="text-center text-text-secondary">Kunde inte ladda översiktsdata.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
            title="Totala Intäkter (TODO)" 
            value={`${(summary.invoicedValue / 1000).toFixed(1)}k kr`} 
            change={0} // Ingen förändringsdata tillgänglig
            changeType='none'
            icon={<div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">$</div>}
        />
        <StatCard 
            title="Pågående Projekt" 
            value={summary.ongoingProjects.toString()} 
            change={0} // Ingen förändringsdata tillgänglig
            changeType='none'
            icon={<div className="w-10 h-10 flex items-center justify-center rounded-lg bg-status-gold/10 text-status-gold">?</div>} 
        />
        <StatCard 
            title="Avslutade Projekt" 
            value={summary.completedProjects.toString()} 
            change={0} // Ingen förändringsdata tillgänglig
            changeType='none'
            icon={<div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500">?</div>} 
        />
    </div>
  );
}
