'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Project } from '@/app/types';
import NewProjectModal from '@/components/NewProjectModal'; // Korrigerad import

// --- Sub-komponent för en projektrad --- 
const ProjectRow = ({ project }: { project: Project }) => {
  const router = useRouter();

  // Navigera till den specifika projektsidan vid klick.
  const handleRowClick = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div 
      className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
      onClick={handleRowClick}
    >
      <div className="col-span-4 font-medium text-white truncate">{project.name}</div>
      <div className="col-span-3 text-gray-400 truncate">{project.customerName || 'N/A'}</div> 
      <div className="col-span-2 text-gray-400">{project.lastActivity ? new Date(project.lastActivity).toLocaleDateString('sv-SE') : '-'}</div>
      <div className="col-span-2 flex items-center">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${project.status === 'Pågående' ? 'bg-green-500/20 text-green-300' : project.status === 'Anbud' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
          {project.status || 'Okänd'}
        </span>
      </div>
      <div className="col-span-1 text-right text-gray-400">...</div>
    </div>
  );
};

// --- Huvudkomponenten för projektvyn --- 
export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Anropa den nya API-endpointen för att lista projekt
        const response = await fetch('/api/projects'); 
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Serverfel: ${response.status}`);
        }
        const data: Project[] = await response.json();
        setProjects(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ett okänt fel inträffade');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    setProjects(currentProjects => [newProject, ...currentProjects]);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Projekt</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Sök projekt..." className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:w-40 md:w-auto" />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-cyan-500 text-white font-semibold py-2 px-3 md:px-4 rounded-lg flex items-center gap-2 hover:bg-cyan-600 transition-colors duration-300">
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Nytt Projekt</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        {/* Tabell-headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-700 text-gray-400 font-bold text-sm">
          <div className="col-span-4">Projektnamn</div>
          <div className="col-span-3">Kund</div>
          <div className="col-span-2">Senaste aktivitet</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1"></div>
        </div>
        
        {/* Laddnings- & Felhantering */}
        {loading && <div className="p-4 text-center text-gray-400">Laddar projekt...</div>}
        {error && <div className="p-4 text-center text-red-400">{`Kunde inte ladda projekt: ${error}`}</div>}
        
        {/* Projektlista */}
        {!loading && !error && projects.map(p => <ProjectRow key={p.id} project={p} />)}

        {/* Tomt tillstånd (om inga projekt finns) */}
        {!loading && !error && projects.length === 0 && (
            <div className="p-8 text-center text-gray-400">
                <h3 className="text-lg font-semibold text-white">Inga projekt hittades</h3>
                <p className="mt-2">Klicka på "Nytt Projekt" för att skapa ditt första projekt.</p>
            </div>
        )}

      </div>
      {/* Modal för att skapa nytt projekt */}
      <NewProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
