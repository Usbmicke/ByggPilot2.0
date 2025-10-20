
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { getProjects } from '@/actions/projectActions';
import ProjectsView from '@/components/views/ProjectsView';
import { logger } from '@/lib/logger';

const ProjectsPage = async () => {
  // Korrekt, standardiserad metod för att hämta sessionen i en Server Component.
  const session = await getServerSession();
  const userId = session?.user?.id;

  // Om ingen userId finns, returnera en tom vy. 
  // Detta bör inte hända tack vare vår middleware, men är en bra säkerhetsåtgärd.
  if (!userId) {
    logger.error("[ProjectsPage] Ingen användar-ID hittades i sessionen.");
    // Returnerar en tom vy för att undvika en krasch.
    return <ProjectsView projects={[]} />;
  }

  const { projects, error } = await getProjects(userId);

  if (error) {
    logger.error({ error }, "Error fetching projects: ");
    return <ProjectsView projects={[]} />;
  }

  return (
      <ProjectsView projects={projects} />
  );
};

export default ProjectsPage;
