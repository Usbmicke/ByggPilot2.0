
'use client';
import React from 'react';
import { demoProjects, demoCustomers } from '../data';
import { DocumentDuplicateIcon, FolderIcon, ClockIcon, ChartBarIcon, PlusCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// --- STATUS- & FÄRG-LOGIK ---
const getStatusChipClass = (status: string) => {
  switch (status) {
    case 'Pågående': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'Planerat': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'Anbud': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'Avslutat': return 'bg-green-500/20 text-green-300 border-green-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

// --- PROJEKTKORT-KOMPONENT ---
const DemoProjectCard = ({ project }: { project: typeof demoProjects[0] }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-lg">
    <div className="p-5 border-b border-gray-700/50">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-white text-lg max-w-xs">{project.name}</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusChipClass(project.status)}`}>
          {project.status}
        </span>
      </div>
      <p className="text-sm text-gray-400 mt-1">{project.customerName}</p>
      <p className="text-xs text-gray-500 mt-0.5">{project.address}</p>
    </div>
    
    <div className="p-5">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-gray-300">Förlopp</span>
          <span className="text-xs font-bold text-white">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Senaste aktivitet: {new Date(project.lastActivity).toLocaleDateString('sv-SE')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <button className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
          <FolderIcon className="w-5 h-5"/>
          Mapp
        </button>
        <button className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
          <ClockIcon className="w-5 h-5"/>
          Tider
        </button>
        <button className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
          <DocumentDuplicateIcon className="w-5 h-5"/>
          Dokument
        </button>
        <button className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
          <ChartBarIcon className="w-5 h-5"/>
          Ekonomi
        </button>
      </div>
    </div>
  </div>
);

// --- HUVUDVY FÖR DEMOPROJEKT ---
const DemoProjectsView = () => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white">Projekt</h1>
            <p className="text-gray-400 mt-1">En samlad överblick över alla dina pågående och avslutade arbeten.</p>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
          <PlusCircleIcon className="w-5 h-5" />
          Nytt Projekt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {demoProjects
          .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
          .map(project => (
            <DemoProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default DemoProjectsView;
