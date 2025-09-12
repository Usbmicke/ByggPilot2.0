
'use client';
import React from 'react';
import { demoTimeEntries, demoProjects } from '../data';
import { ClockIcon, PlusCircleIcon, DocumentArrowDownIcon, CalendarDaysIcon, TagIcon } from '@heroicons/react/24/outline';

// --- TIDKORTS-KOMPONENT ---
const DemoTimeEntryCard = ({ entry }: { entry: typeof demoTimeEntries[0] }) => (
  <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div className="flex-grow">
        <p className="font-semibold text-white">{entry.projectName}</p>
        <p className="text-sm text-gray-400">{entry.customerName}</p>
        <p className="text-sm text-gray-500 mt-2 italic">\"{entry.comment}\"</p>
    </div>
    <div className="flex-shrink-0 w-full sm:w-auto mt-3 sm:mt-0">
        <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">{new Date(entry.date).toLocaleDateString('sv-SE')}</span>
            </div>
            <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white text-lg">{entry.hours.toFixed(1)}h</span>
            </div>
        </div>
    </div>
  </div>
);

// --- HUVUDVY FÖR DEMO-TIDRAPPORTERING ---
const DemoTimeTrackingView = () => {
  const totalHours = demoTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tidrapportering</h1>
          <p className="text-gray-400 mt-1">Enkel registrering och tydlig överblick av arbetade timmar.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <DocumentArrowDownIcon className="w-5 h-5" />
                Exportera
            </button>
            <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
                <PlusCircleIcon className="w-5 h-5" />
                Registrera Tid
            </button>
        </div>
      </div>
      
      {/* --- STATISTIK-KORT --*/}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-400">Timmar (idag)</p>
              <p className="text-2xl font-bold text-white">{demoTimeEntries[0]?.hours.toFixed(1) || '0.0'}h</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-400">Timmar (denna vecka)</p>
              <p className="text-2xl font-bold text-white">{totalHours.toFixed(1)}h</p>
          </div>
           <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-400">Aktiva Projekt</p>
              <p className="text-2xl font-bold text-white">{demoProjects.filter(p => p.status === 'Pågående').length}</p>
          </div>
           <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-400">Väntar på anbud</p>
              <p className="text-2xl font-bold text-white">{demoProjects.filter(p => p.status === 'Anbud').length}</p>
          </div>
      </div>

      {/* --- SENASTE RAPPORTER --*/}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Senaste Rapporter</h2>
        <div className="space-y-4">
          {demoTimeEntries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(entry => (
              <DemoTimeEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoTimeTrackingView;
