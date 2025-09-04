'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconChevronDown, IconPlus, IconSearch } from '@/app/constants';
import { Project } from '@/app/types';
import NewProjectModal from '@/app/components/NewProjectModal';

const ProjectRow = ({ project }) => {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div 
      className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
      onClick={handleRowClick}
    >
      <div className="col-span-4 font-medium text-white">{project.name}</div>
      <div className="col-span-3 text-gray-400">{project.customerName}</div>
      <div className="col-span-2 text-gray-400">{new Date(project.lastActivity).toLocaleDateString('sv-SE')}</div>
      <div className="col-span-2 flex items-center">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${project.status === 'Pågående' ? 'bg-green-500/20 text-green-300' : project.status === 'Anbud' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
          {project.status}
        </span>
      </div>
      <div className="col-span-1 text-right">...</div>
    </div>
  );
};

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        }
         else {
            setError('An unknown error occurred');
        }
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Projekt</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Sök projekt..." className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-cyan-600 transition-colors duration-300">
            <IconPlus className="w-5 h-5" />
            <span>Nytt Projekt</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 text-gray-400 font-bold text-sm">
          <div className="col-span-4">Projektnamn</div>
          <div className="col-span-3">Kund</div>
          <div className="col-span-2">Senaste aktivitet</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1"></div>
        </div>
        
        {loading && <div className="p-4 text-center text-gray-400">Laddar projekt...</div>}
        {error && <div className="p-4 text-center text-red-400">Kunde inte ladda projekt: {error}</div>}
        {!loading && !error && projects.map(p => <ProjectRow key={p.id} project={p} />)}
        {!loading && !error && projects.length === 0 && <div className="p-4 text-center text-gray-400">Inga projekt hittades.</div>}

      </div>
      <NewProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
