
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { firestore as db } from '@/app/lib/firebase/client';
import { Project } from '@/app/types/project';
import Link from 'next/link';

// Helper for status chip styling
const getStatusChipClass = (status: Project['status']) => {
  switch (status) {
    case 'Positiv':
      return 'bg-status-gold/20 text-status-gold';
    case 'Varning':
      return 'bg-status-danger/20 text-status-danger';
    case 'Pågående':
      return 'bg-status-gold/20 text-status-gold';
    case 'Avslutat':
    case 'Fakturerat':
    case 'Offert':
      return 'bg-accent-blue/20 text-accent-blue';
    case 'Arkiverat':
      return 'bg-background-primary/50 text-text-secondary';
    default:
      return 'bg-background-primary';
  }
};

// Helper for project card styling
const getProjectCardClass = (status: Project['status']) => {
    const baseClasses = "block bg-background-secondary p-6 rounded-lg border transition-all duration-300 hover:shadow-lg";
  
    switch (status) {
      case 'Positiv':
        return `${baseClasses} border-status-gold/50 shadow-lg shadow-status-gold/10 animate-pulse-slow hover:border-status-gold hover:bg-background-primary`;
      case 'Varning':
        return `${baseClasses} border-status-danger/50 hover:border-status-danger hover:bg-background-primary`;
      default:
        return `${baseClasses} border-border-primary hover:bg-background-primary hover:border-accent-blue/50`;
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
          .filter(project => project.status !== 'Arkiverat');

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
                <div key={i} className="bg-background-secondary p-6 rounded-lg border border-border-primary animate-pulse">
                    <div className="h-5 bg-border-primary rounded w-1/4 mb-2"></div>
                    <div className="h-8 bg-border-primary rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-border-primary rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center bg-background-secondary border border-dashed border-border-primary p-12 rounded-lg">
        <h3 className="text-xl font-semibold text-text-primary">Du har inga aktiva projekt än.</h3>
        <p className="text-text-secondary mt-2">Klicka på "+ Skapa Nytt Projekt" för att komma igång.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <Link href={`/dashboard/projects/${project.id}`} key={project.id} className={getProjectCardClass(project.status)}>
          <div className="flex justify-between items-start">
            <p className="text-sm text-accent-blue font-mono">#{project.projectNumber}</p>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(project.status)}`}>
              {project.status}
            </span>
          </div>
          <h3 className="text-xl font-bold text-text-primary mt-2 truncate">{project.projectName}</h3>
          <p className="text-text-secondary truncate">{project.clientName}</p>
        </Link>
      ))}
    </div>
  );
}
