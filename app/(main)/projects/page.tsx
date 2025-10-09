
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getProjects } from '@/services/projectService';
import ProjectsView from '@/components/views/ProjectsView';

const ProjectsPage = async () => {
  // Korrekt, standardiserad metod för att hämta sessionen i en Server Component.
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Om ingen userId finns, returnera en tom vy. 
  // Detta bör inte hända tack vare vår middleware, men är en bra säkerhetsåtgärd.
  if (!userId) {
    console.error("[ProjectsPage] Ingen användar-ID hittades i sessionen.");
    // Returnerar en tom vy för att undvika en krasch.
    return <ProjectsView projects={[]} />;
  }

  const projects = await getProjects(userId);

  return (
      <ProjectsView projects={projects} />
  );
};

export default ProjectsPage;
