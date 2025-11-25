import { db } from '@/lib/dal/firebase-admin';
import { verifySession } from '@/lib/auth/session'; // Assuming session verification lives here
import { CreateProjectSchema, ProjectSchema } from '@/lib/dal/dto/project.dto.ts';
import { z } from 'zod';

const projectsCollection = db.collection('projects');

/**
 * Creates a new project in Firestore, ensuring the user is authenticated.
 * @param projectData - Data for the new project.
 * @returns The newly created project object.
 */
export const createProject = async (projectData: z.infer<typeof CreateProjectSchema>) => {
  const session = await verifySession(); // Gatekeeper check
  if (session.uid !== projectData.ownerId) {
    throw new Error('Unauthorized: You can only create projects for yourself.');
  }

  const validatedData = CreateProjectSchema.parse(projectData);
  const docRef = await projectsCollection.add({
   ...validatedData,
    createdAt: new Date(),
  });

  const newProject = await getProjectById(docRef.id);
  return newProject;
};

/**
 * Fetches a single project by its ID, verifying the user's access.
 * @param id - The project ID.
 * @returns The project object or null if not found/no access.
 */
export const getProjectById = async (id: string) => {
  const session = await verifySession();
  const doc = await projectsCollection.doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const project = ProjectSchema.parse({ id: doc.id, ...doc.data() });

  if (project.ownerId !== session.uid) {
    // Even if the project exists, don't leak its existence.
    return null;
  }

  return project;
};

/**
 * Lists all projects for the currently authenticated user.
 * @returns An array of project objects.
 */
export const listProjectsForUser = async () => {
  const session = await verifySession();
  const snapshot = await projectsCollection.where('ownerId', '==', session.uid).orderBy('createdAt', 'desc').get();

  return snapshot.docs.map(doc => ProjectSchema.parse({ id: doc.id, ...doc.data() }));
};
