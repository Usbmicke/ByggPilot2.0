
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/app/services/firestoreService';
import { Project, ProjectStatus } from '@/app/types';
import { createProjectFolder, findFolderInParent, getGoogleAuth } from '@/app/services/driveService';
import { generateRiskAnalysis } from '@/app/services/aiService';
import { createRiskAnalysisDocument } from '@/app/services/documentService';
import { google } from 'googleapis';

interface CreateProjectData {
  name: string;
  customerId: string;
  customerName: string;
  status: ProjectStatus;
  ownerId: string;
}

export interface CreateProjectResult {
    project: Project;
    riskAnalysis?: {
        summary: string;
        documentUrl: string;
    };
}

// ... (getProject and listProjects remain the same)
export async function getProject(projectId: string): Promise<Project | null> {
    // ... no changes
    return null;
}
export async function listProjects(ownerId: string, customerId?: string): Promise<Project[]> {
    // ... no changes
    return [];
}


/**
 * Creates a new project, its Google Drive folder, and an automated initial risk analysis.
 * @param projectData The data for the new project.
 * @param accessToken The user's Google access token for API calls.
 * @returns A promise that resolves to an object containing the new project and optional risk analysis results.
 */
export async function createProject(projectData: CreateProjectData, accessToken: string): Promise<CreateProjectResult> {
  const { name, customerId, customerName, status, ownerId } = projectData;

  if (!name || !customerId || !ownerId || !accessToken) {
    throw new Error('Missing required fields or access token to create a project.');
  }

  try {
    const projectPayload = { /* ... payload ... */ };
    const projectDocRef = await db.collection("projects").add(projectPayload);

    let driveFolderId: string | null = null;
    let riskAnalysisResult: CreateProjectResult['riskAnalysis'];

    try {
      driveFolderId = await createProjectFolder(name, customerName);
      await projectDocRef.update({ driveFolderId: driveFolderId });

      // --- Automated Risk Analysis --- 
      const auth = getGoogleAuth(accessToken);
      const drive = google.drive({ version: 'v3', auth });
      const docs = google.docs({ version: 'v1', auth });

      const analysis = await generateRiskAnalysis(name, "Nybyggnation av villa"); // Example description
      if (analysis) {
          const docSubfolderName = '03_Bilder & Dokumentation';
          const docFolderId = await findFolderInParent(drive, driveFolderId, docSubfolderName);
          if (docFolderId) {
              const { documentUrl } = await createRiskAnalysisDocument(docs, drive, analysis, name, docFolderId);
              riskAnalysisResult = { summary: analysis.summary, documentUrl };
              await projectDocRef.update({ riskAnalysisUrl: documentUrl }); // Save link to DB
          } else {
              console.warn(`Could not find subfolder '${docSubfolderName}' for project ${name}. Risk analysis doc not created.`);
          }
      }
      // --- End of Risk Analysis --- 

    } catch (driveOrAnalysisError) {
      console.error("Error during Drive/Analysis creation for project:", driveOrAnalysisError);
      // Do not re-throw; the core project is created, which is the main goal.
    }

    const newProject: Project = {
      id: projectDocRef.id,
      name, customerId, customerName, status, ownerId, driveFolderId,
      // ... other fields initialized to null/default ...
      address: null, lat: undefined, lon: undefined, progress: 0, 
      lastActivity: new Date().toISOString(), createdAt: new Date().toISOString(),
    };

    return { project: newProject, riskAnalysis: riskAnalysisResult };

  } catch (error) {
    console.error("Fatal error creating project: ", error);
    throw new Error('Failed to create project in Firestore.');
  }
}
