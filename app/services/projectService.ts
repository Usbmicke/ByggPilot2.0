
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/app/services/firestoreService';
import { Project, ProjectStatus } from '@/app/types';
import { createProjectFolder } from '@/app/services/driveService';

interface CreateProjectData {
  name: string;
  customerId: string;
  customerName: string;
  status: ProjectStatus;
  ownerId: string;
}

/**
 * Lists projects for a specific user, with an optional filter for customerId.
 * @param ownerId The ID of the user whose projects to fetch.
 * @param customerId (Optional) The ID of the customer to filter by.
 * @returns A promise that resolves to an array of projects.
 */
export async function listProjects(ownerId: string, customerId?: string): Promise<Project[]> {
  if (!ownerId) {
    console.error("listProjects: ownerId is required");
    return [];
  }

  try {
    let projectsQuery: FirebaseFirestore.Query = db.collection('projects').where('ownerId', '==', ownerId);
    
    if (customerId) {
      projectsQuery = projectsQuery.where('customerId', '==', customerId);
    }

    const querySnapshot = await projectsQuery.get();

    const projects: Project[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Konvertera Firestore Timestamps till ISO-strängar
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
      const lastActivity = data.lastActivity?.toDate ? data.lastActivity.toDate().toISOString() : new Date().toISOString();

      return {
        id: doc.id,
        name: data.name,
        customerId: data.customerId,
        customerName: data.customerName,
        status: data.status as ProjectStatus,
        ownerId: data.ownerId, // Se till att ownerId inkluderas
        driveFolderId: data.driveFolderId ?? null,
        address: data.address ?? null,
        lat: data.lat ?? undefined,
        lon: data.lon ?? undefined,
        progress: data.progress ?? 0,
        lastActivity: lastActivity,
        createdAt: createdAt,
      };
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects: ", error);
    // Returnera en tom array vid fel för att inte krascha klienten helt
    return [];
  }
}

/**
 * Creates a new project, including its Google Drive folder.
 * @param projectData The data for the new project.
 * @returns A promise that resolves to the newly created project.
 */
export async function createProject(projectData: CreateProjectData): Promise<Project> {
  const { name, customerId, customerName, status, ownerId } = projectData;

  if (!name || !customerId || !customerName || !status || !ownerId) {
    throw new Error('Missing required fields to create a project.');
  }

  try {
    const projectPayload = {
      name,
      customerId,
      customerName,
      status,
      ownerId,
      driveFolderId: null,
      address: null,
      lat: null,
      lon: null,
      progress: 0,
      lastActivity: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    };

    const projectDocRef = await db.collection("projects").add(projectPayload);

    let driveFolderId: string | null = null;
    try {
      driveFolderId = await createProjectFolder(name, customerName);
      await projectDocRef.update({ driveFolderId: driveFolderId });
    } catch (driveError) {
      console.error("Could not create Google Drive folder. Project created without it.", driveError);
    }

    const newProject: Project = {
      id: projectDocRef.id,
      name,
      customerId,
      customerName,
      status,
      ownerId,
      driveFolderId,
      address: null,
      lat: undefined,
      lon: undefined,
      progress: 0,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return newProject;
  } catch (error) {
    console.error("Error creating project: ", error);
    throw new Error('Failed to create project in Firestore.');
  }
}
