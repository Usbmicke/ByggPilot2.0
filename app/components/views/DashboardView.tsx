'use client';
import React, { useState, useEffect } from 'react';
// Importen för useAuth är nu borttagen
import { DocumentPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ProjectCard from '@/app/components/dashboard/ProjectCard';
import { Project } from '@/app/types';

interface DashboardViewProps {
  username: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ username }) => {
  // useAuth-hooken är borttagen.
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Data hämtas bara om ett användarnamn finns (vilket det alltid kommer göra här).
    if (username) {
      const fetchProjects = async () => {
        try {
          setIsLoading(true);
          console.log("Simulerar hämtning av projekt...");
          const data: Project[] = []; // Simulerad tom lista
          setProjects(data);
        } catch (err: any) {
          setError('Kunde inte hämta projekt från databasen.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProjects();
    }
  }, [username]); // Effekt triggas nu när username-propen ändras.

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Översikt, {username}</h2>
        <button
          onClick={() => alert('Funktionen \'Skapa Offert\' är under utveckling!')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
        >
          <DocumentPlusIcon className="w-5 h-5" />
          <span>Skapa Offort</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} onClick={() => alert(`Navigerar till projekt ${project.name}`)} className="cursor-pointer">
            <ProjectCard project={project} showWeather={true} />
          </div>
        ))}
      </div>

       {error && (
         <div className="text-center py-16 px-6 bg-red-900/30 border border-red-700 rounded-xl mt-6">
           <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-red-400 mb-3"/>
           <h3 className="text-xl font-bold text-white">Kunde inte ladda projekt</h3>
           <p className="text-red-300 mt-2">{error}</p>
         </div>
       )}
    </div>
  );
};

export default DashboardView;
