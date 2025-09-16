'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext'; // <-- Rätt auth-system
import { DocumentPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ProjectCard from '@/app/components/dashboard/ProjectCard';
import { Project } from '@/app/types';

// Propsen är nu mycket enklare
interface DashboardViewProps {
  username: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ username }) => {
  const { user } = useAuth(); // Använder vår hook
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Data hämtas bara om en användare är inloggad
    if (user) {
      const fetchProjects = async () => {
        try {
          setIsLoading(true);
          // Simulerar en API-anrop för att hämta projekt
          // I en verklig app, ersätt detta med: const response = await fetch('/api/projects/list');
          console.log("Simulerar hämtning av projekt...");
          // För demonstration, returnerar vi en tom lista.
          // I en riktig app skulle detta komma från ditt API.
          const data: Project[] = []; 
          setProjects(data);
        } catch (err: any) {
          setError('Kunde inte hämta projekt från databasen.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProjects();
    }
  }, [user]); // Effekt triggas när user-objektet ändras

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Översikt, {username}</h2>
        <button
          onClick={() => alert('Funktionen \'Skapa Offert\' är under utveckling!')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
        >
          <DocumentPlusIcon className="w-5 h-5" />
          <span>Skapa Offert</span>
        </button>
      </div>

      {/* Notera: Logiken för att visa ZeroState är nu borttagen härifrån */}
      {/* Den hanteras på den övergripande sid-nivån (`dashboard/page.tsx`) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} onClick={() => alert(`Navigerar till projekt ${project.name}`)} className="cursor-pointer">
            <ProjectCard project={project} showWeather={true} />
          </div>
        ))}
      </div>
       {/* Om det finns ett fel visas det här, oberoende av ZeroState */}
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
