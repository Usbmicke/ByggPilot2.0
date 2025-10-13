
import React from 'react';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { getProject } from '@/services/projectService';
import { getFilesForProject } from '@/services/firestoreService';
import DocumentsView from '@/components/views/DocumentsView';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    projectId: string;
  };
}

const ProjectDocumentsPage = async ({ params }: PageProps) => {
  const { projectId } = params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return notFound();
  }

  const project = await getProject(projectId, userId);
  if (!project) {
    return notFound();
  }

  const files = await getFilesForProject(projectId);

  return <DocumentsView project={project} initialFiles={files} />;
};

export default ProjectDocumentsPage;
