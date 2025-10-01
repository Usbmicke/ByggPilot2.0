
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface SummaryData {
  totalProjects: number;
  ongoingProjects: number;
  invoicedValue: number;
  // Framtida jämförelsedata
  totalProjectsChange: number;
  ongoingProjectsChange: number;
  invoicedValueChangePercent: number;
}

// Guldstandard-komponent för ett enskilt KPI-kort
const StatCard: React.FC<{ title: string; value: string; change: number; changeType: 'percent' | 'absolute' | 'none'; changeText?: string; icon: React.ReactNode }> = ({ title, value, change, changeType, changeText, icon }) => {
  const isPositive = change >= 0;
  const ChangeIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;
  
  // Skapar den dynamiska texten för förändring
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


export default function DashboardSummary() {
  // Dummy-data för att illustrera Guldstandard-konceptet
  const summary: SummaryData = {
      totalProjects: 12,
      ongoingProjects: 5,
      invoicedValue: 125350,
      totalProjectsChange: 2, // +2 projekt
      ongoingProjectsChange: -1, // -1 projekt
      invoicedValueChangePercent: 15.2, // +15.2%
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
            title="Totala Intäkter" 
            value={`${(summary.invoicedValue / 1000).toFixed(1)}k kr`} 
            change={summary.invoicedValueChangePercent}
            changeType='percent'
            changeText="vs. förra månaden"
            icon={<div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">$</div>}
        />
        <StatCard 
            title="Pågående Projekt" 
            value={summary.ongoingProjects.toString()} 
            change={summary.ongoingProjectsChange}
            changeType='absolute'
            changeText="vs. förra kvartalet"
            icon={<div className="w-10 h-10 flex items-center justify-center rounded-lg bg-status-gold/10 text-status-gold">?</div>} 
        />
        <StatCard 
            title="Avslutade Projekt" 
            value={summary.totalProjects.toString()} 
            change={summary.totalProjectsChange}
            changeType='absolute'
            changeText="i år"
            icon={<div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500">?</div>} 
        />
    </div>
  );
}
