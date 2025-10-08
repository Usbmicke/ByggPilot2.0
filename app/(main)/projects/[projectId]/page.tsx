'use client';

import React from 'react';
import ProjectDetailView from '@/components/views/ProjectDetailView';

// Denna komponent fungerar som en "wrapper" eller "entry point" för en specifik projektsida.
// Dess enda uppgift är att fånga upp `projectId` från URL:en och skicka den vidare
// till den klient-renderade komponenten som innehåller all logik och UI.

interface ProjectDetailPageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // Extrahera projectId från params som kommer från Next.js dynamiska routing.
  const { projectId } = params;

  // Rendera klientkomponenten och skicka med projectId som en prop.
  return <ProjectDetailView projectId={projectId} />;
}
