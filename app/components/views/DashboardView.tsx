
'use client';
import React, { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { FolderPlusIcon, ArrowRightIcon, DocumentPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ProjectCard from '@/app/components/dashboard/ProjectCard';
import RecentEventsWidget from '@/app/components/dashboard/RecentEventsWidget';
import TodoWidget from '@/app/components/dashboard/TodoWidget';
import { Project } from '@/app/types'; // Importera den fullständiga Project-typen

interface DashboardViewProps {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  onStartOnboarding: () => void;
  onStartQuoteFlow: () => void;
  onProjectClick: (project: Project) => void;
}

const OnboardingCard = ({ onStartOnboarding }: { onStartOnboarding: () => void }) => (
  <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-6 rounded-xl shadow-lg border border-cyan-500/50 flex flex-col items-center text-center">
    <FolderPlusIcon className="h-12 w-12 text-white/90 mb-3"/>
    <h3 className="text-xl font-bold text-white">Redo att organisera?</h3>
    <p className="text-white/80 mt-2 mb-4 text-sm max-w-sm">
      Låt ByggPilot skapa en standardiserad mappstruktur och offertmall direkt i din Google Drive. 
    </p>
    <button 
      onClick={onStartOnboarding}
      className="bg-white text-cyan-700 font-semibold py-2 px-5 rounded-lg shadow hover:bg-gray-100 transition-transform transform hover:scale-105 flex items-center gap-2"
    >
      Konfigurera startpaket
      <ArrowRightIcon className="w-4 h-4" />
    </button>
  </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ session, status, onStartOnboarding, onStartQuoteFlow, onProjectClick }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchProjects = async () => {
        try {
          setIsLoading(true);
          // **KORRIGERING: Anropar rätt API för att hämta projekt från Firestore**
          const response = await fetch('/api/projects/list');
          if (!response.ok) {
            throw new Error('Något gick fel vid hämtning av projekt från databasen.');
          }
          const data = await response.json();
          setProjects(data || []); // API:et returnerar en array direkt
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 space-y-8">
        {status === 'authenticated' && !isLoading && projects.length === 0 && !error &&(
          <OnboardingCard onStartOnboarding={onStartOnboarding} />
        )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(project => (
                <div key={project.id} onClick={() => onProjectClick(project)} className="cursor-pointer">
                  {/* Skickar med hela det korrekta projektobjektet till ProjectCard */}
                  <ProjectCard project={project} showWeather={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-gray-800/50 border border-gray-700 rounded-xl">
              <h3 className="text-xl font-bold text-white">Välkommen till ByggPilot!</h3>
              {status === 'authenticated' ? (
                <p className="text-gray-400 mt-2">Du har inga projekt än. Klicka på \"Skapa Offert\" för att starta ett nytt.</p>
              ) : (
                <p className="text-gray-400 mt-2">Logga in med Google för att se dina projekt.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-8">
        <RecentEventsWidget />
        <TodoWidget />
      </div>
    </div>
  );
};

export default DashboardView;
