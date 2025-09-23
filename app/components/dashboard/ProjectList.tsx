'use client';

import React from 'react';
import type { Project } from '@/app/types/project'; // Säkerställer korrekt typning
import Link from 'next/link';
import { FolderIcon } from '@heroicons/react/24/outline'; // Ikon för tomt tillstånd

// Helper för status-chip styling, anpassad för mörkt tema
const getStatusChipClass = (status: Project['status']) => {
  switch (status) {
    case 'Positiv': return 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30';
    case 'Varning': return 'bg-red-400/10 text-red-400 border border-red-400/30';
    case 'Pågående': return 'bg-blue-400/10 text-blue-400 border border-blue-400/30';
    case 'Avslutad': return 'bg-green-400/10 text-green-400 border border-green-400/30';
    case 'Fakturerat': return 'bg-purple-400/10 text-purple-400 border border-purple-400/30';
    case 'Offert': return 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30';
    case 'Arkiverat': return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
    default: return 'bg-gray-700 text-gray-300';
  }
};

// Helper för projekt-kort-styling, anpassad för mörkt tema
const getProjectCardClass = (status: Project['status']) => {
    const baseClasses = "block bg-gray-800/50 p-6 rounded-lg border transition-all duration-300 hover:shadow-lg hover:scale-[1.02]";
    switch (status) {
      case 'Positiv': return `${baseClasses} border-yellow-600/50 hover:border-yellow-500`;
      case 'Varning': return `${baseClasses} border-red-600/50 hover:border-red-500`;
      default: return `${baseClasses} border-gray-700 hover:border-indigo-500`;
    }
  };

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
}

export function ProjectList({ projects, isLoading }: ProjectListProps) {

  // Laddnings-skelett som matchar det mörka temat
  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
                    <div className="h-6 bg-gray-600 rounded w-3/4 mb-5"></div>
                    <div className="h-5 bg-gray-700 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
  }

  // Förbättrat "tomt tillstånd" som passar designen
  if (projects.length === 0) {
    return (
      <div className="text-center bg-gray-800/50 border-2 border-dashed border-gray-700 p-12 rounded-lg">
        <FolderIcon className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-300">Du har inga aktiva projekt.</h3>
        <p className="mt-1 text-sm text-gray-500">Klicka på "+ Skapa Offert" i menyn för att komma igång.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <Link href={`/dashboard/projects/${project.id}`} key={project.id} className={getProjectCardClass(project.status)}>
            <div className="flex justify-between items-start">
                <p className="text-sm font-mono text-cyan-400">#{project.projectNumber || '---'}</p>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusChipClass(project.status)}`}>
                    {project.status}
                </span>
            </div>
            <div className="mt-3">
                <h3 className="text-lg font-bold text-white truncate" title={project.projectName}>{project.projectName}</h3>
                <p className="text-gray-400 truncate" title={project.clientName}>{project.clientName}</p>
            </div>
        </Link>
      ))}
    </div>
  );
}
