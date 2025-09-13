
'use client';
import React, { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { DocumentPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ProjectCard from '@/app/components/dashboard/ProjectCard';
import { Project } from '@/app/types';

interface DashboardViewProps {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  onStartQuoteFlow: () => void;
  onProjectClick: (project: Project) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ session, status, onStartQuoteFlow, onProjectClick }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchProjects = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/projects/list');
          if (!response.ok) {
            throw new Error('Något gick fel vid hämtning av projekt från databasen.');
          }
          const data = await response.json();
          setProjects(data || []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProjects();
    }
    if(status === 'unauthenticated') {
        setIsLoading(false);
        setProjects([]);
    }
  }, [status]);

  return (
    <div className="animate-fade-in">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Mina Projekt</h2>
            {status === 'authenticated' && (
              <button
                onClick={onStartQuoteFlow}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <DocumentPlusIcon className="w-5 h-5" />
                Skapa Offert
              </button>
            )}
          </div>

          {isLoading ? (
             <div className="text-center py-16 px-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                <p className="text-gray-400">Laddar projekt från databasen...</p>
             </div>
          ) : error ? (
            <div className="text-center py-16 px-6 bg-red-900/30 border border-red-700 rounded-xl">
              <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-red-400 mb-3"/>
              <h3 className="text-xl font-bold text-white">Kunde inte ladda projekt</h3>
              <p className="text-red-300 mt-2">{error}</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div key={project.id} onClick={() => onProjectClick(project)} className="cursor-pointer">
                  <ProjectCard project={project} showWeather={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-gray-800/50 border border-gray-700 rounded-xl">
              <h3 className="text-xl font-bold text-white">Välkommen till ByggPilot!</h3>
              <p className="text-gray-400 mt-2">Du har inga projekt än. Klicka på "Skapa Offert" för att starta ett nytt.</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default DashboardView;
