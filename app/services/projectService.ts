
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp, updateDoc, QueryConstraint } from 'firebase/firestore';
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
    const queryConstraints: QueryConstraint[] = [where('ownerId', '==', ownerId)];
    if (customerId) {
      queryConstraints.push(where('customerId', '==', customerId));
    }

    const projectsQuery = query(collection(db, 'projects'), ...queryConstraints);
    const querySnapshot = await getDocs(projectsQuery);

    const projects: Project[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        customerId: data.customerId,
        customerName: data.customerName,
        status: data.status as ProjectStatus,
        driveFolderId: data.driveFolderId ?? null,
        address: data.address ?? null,
        lat: data.lat ?? undefined,
        lon: data.lon ?? undefined,
        progress: data.progress ?? 0,
        lastActivity: data.lastActivity?.toDate().toISOString() ?? new Date().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
      };
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects: ", error);
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
    const projectDocRef = await addDoc(collection(db, "projects"), {
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
      lastActivity: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    let driveFolderId: string | null = null;
    try {
      driveFolderId = await createProjectFolder(name, customerName);
      await updateDoc(projectDocRef, { driveFolderId: driveFolderId });
    } catch (driveError) {
      console.error("Could not create Google Drive folder. Project created without it.", driveError);
      // The project is still created, just without the folder. This is acceptable.
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
