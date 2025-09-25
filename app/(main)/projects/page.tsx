
import React from 'react';
import { auth } from '@/app/lib/auth';
import { getProjects } from '@/app/services/projectService';
import ProjectsView from '@/app/components/views/ProjectsView';

const ProjectsPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  // Om ingen userId finns, returnera en tom vy.
  // Detta bör i praktiken inte hända tack vare NextAuth middleware.
  if (!userId) {
    return <ProjectsView projects={[]} />;
  }

  const projects = await getProjects(userId);

  return (
      <ProjectsView projects={projects} />
  );
};

export default ProjectsPage;
