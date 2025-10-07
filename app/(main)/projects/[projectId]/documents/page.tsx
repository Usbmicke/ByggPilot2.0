
import React from 'react';
import { auth } from '@/lib/auth';
import { getProject } from '@/services/projectService';
import { getFilesForProject } from '@/services/firestoreService';
import ProjectDocumentsView from '@/components/views/ProjectDocumentsView';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    projectId: string;
  };
}

const ProjectDocumentsPage = async ({ params }: PageProps) => {
  const { projectId } = params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return notFound();
  }

  const project = await getProject(projectId, userId);
  if (!project) {
    return notFound();
  }

  const files = await getFilesForProject(projectId);

  return <ProjectDocumentsView project={project} initialFiles={files} />;
};

export default ProjectDocumentsPage;
