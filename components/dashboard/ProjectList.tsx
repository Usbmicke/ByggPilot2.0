
'use client';

import React, { useState, useEffect } from 'react';
import type { Project } from '@/types/project';
import { FolderIcon } from '@heroicons/react/24/outline';

import ProjectCard from './ProjectCard'; // Importera den nya, självständiga kortkomponenten
import NewTimeEntryModal from '@/components/NewTimeEntryModal'; // Korrigerad importsökväg

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeReportProjectId, setTimeReportProjectId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects/list');
        if (!response.ok) throw new Error('Kunde inte hämta projekt.');
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleReportTime = (projectId: string) => {
    setTimeReportProjectId(projectId);
  };

  const handleCloseModal = () => {
    setTimeReportProjectId(null);
  };

  // Uppdaterat laddningsläge med nya design-tokens
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-component-background p-5 rounded-lg border border-border">
            <div className="animate-pulse flex flex-col gap-4">
              <div className="flex justify-between items-start">
                  <div className="h-5 bg-border rounded w-3/4"></div>
                  <div className="h-4 bg-border rounded w-1/4"></div>
              </div>
              <div className="space-y-2">
                  <div className="h-4 bg-border rounded w-1/2"></div>
                  <div className="h-4 bg-border rounded w-5/6"></div>
              </div>
              <div className="flex justify-end pt-4">
                  <div className="h-9 w-24 bg-border rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-status-red">Fel: {error}</p>;
  }

  // Uppdaterat tomt läge med nya design-tokens
  if (projects.length === 0) {
    return (
      <div className="text-center bg-component-background border-2 border-dashed border-border p-12 rounded-lg">
        <FolderIcon className="mx-auto h-12 w-12 text-text-secondary" />
        <h3 className="mt-4 text-lg font-medium text-text-primary">Du har inga aktiva projekt.</h3>
        <p className="mt-1 text-sm text-text-secondary">Skapa ett nytt projekt via "+ Skapa Nytt"-knappen.</p>
      </div>
    );
  }

  return (
    <div>
      {timeReportProjectId && (
        <NewTimeEntryModal projectId={timeReportProjectId} onClose={handleCloseModal} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onReportTime={handleReportTime} 
          />
        ))}
      </div>
    </div>
  );
}
