'use client';

import React from 'react';
import ProjectsView from '@/app/components/views/ProjectsView';

/**
 * Sidan för att visa en lista över alla användarens projekt.
 * Denna komponent fungerar som en "host" för den mer komplexa ProjectsView.
 */
export default function ProjectsPage() {
  return <ProjectsView />;
}
