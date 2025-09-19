
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { firestore as db } from '@/app/lib/firebase/client';
import { Project } from '@/app/types/project';
import Link from 'next/link';

// Helper for formatting
const getStatusChipClass = (status: Project['status']) => {
  switch (status) {
    case 'Pågående':
      return 'bg-yellow-500/20 text-yellow-300';
    case 'Avslutat':
      return 'bg-green-500/20 text-green-300';
    case 'Fakturerat':
        return 'bg-cyan-500/20 text-cyan-300';
    case 'Offert':
      return 'bg-blue-500/20 text-blue-300';
    case 'Arkiverat': // Added for completeness, though they will be filtered out
      return 'bg-gray-500/20 text-gray-300';
    default:
      return 'bg-gray-600';
  }
};

interface ProjectListProps {
  updateTrigger: number;
}

export default function ProjectList({ updateTrigger }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', session.user.id),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const projectsData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Project))
          .filter(project => project.status !== 'Arkiverat'); // FILTRERA BORT ARKIVERADE

        setProjects(projectsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Fel vid hämtning av projektlista:", error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [session, updateTrigger]);

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-pulse">
                    <div className="h-5 bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center bg-gray-800/50 border border-dashed border-gray-700 p-12 rounded-lg">
        <h3 className="text-xl font-semibold text-white">Du har inga aktiva projekt än.</h3>
        <p className="text-gray-400 mt-2">Klicka på "+ Skapa Nytt Projekt" för att komma igång.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="block bg-gray-800/50 hover:bg-gray-800/80 p-6 rounded-lg border border-gray-700 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg">
          <div className="flex justify-between items-start">
            <p className="text-sm text-cyan-400 font-mono">#{project.projectNumber}</p>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(project.status)}`}>
              {project.status}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-2 truncate">{project.projectName}</h3>
          <p className="text-gray-400 truncate">{project.clientName}</p>
        </Link>
      ))}
    </div>
  );
}
