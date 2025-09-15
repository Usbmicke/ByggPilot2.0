
import { Project, ProjectStatus, Customer } from '@/app/types';
import { readData, writeData } from './jsonUtils';

const PROJECTS_FILE = 'app/data/projects.json';

// Läs alla projekt från fil
const listAllProjects = async (): Promise<Project[]> => {
  return await readData(PROJECTS_FILE);
};

// Skriv alla projekt till fil
const saveAllProjects = async (projects: Project[]) => {
  await writeData(PROJECTS_FILE, projects);
};

// Hämta alla projekt för en specifik användare (filtrerar bort arkiverade)
export const listProjects = async (userId: string): Promise<Project[]> => {
    const projects = await listAllProjects();
    return projects.filter(p => p.userId === userId && !p.archivedAt);
};

// Hämta alla arkiverade projekt för en specifik användare
export const listArchivedProjects = async (userId: string): Promise<Project[]> => {
    const projects = await listAllProjects();
    return projects.filter(p => p.userId === userId && !!p.archivedAt);
};

// Hämta ett enskilt projekt
export const getProject = async (projectId: string, userId: string): Promise<Project | null> => {
    const projects = await listProjects(userId);
    return projects.find(p => p.id === projectId) || null;
};

// Skapa ett nytt projekt
export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'lastActivity' | 'archivedAt'>): Promise<Project> => {
    const projects = await listAllProjects();
    const now = new Date().toISOString();
    
    const newProject: Project = {
        ...projectData,
        id: `proj_${Date.now()}`,
        createdAt: now,
        lastActivity: now,
        archivedAt: null,
    };

    projects.push(newProject);
    await saveAllProjects(projects);
    return newProject;
};

// Uppdatera ett projekt
export const updateProject = async (projectId: string, userId: string, updates: Partial<Omit<Project, 'id' | 'userId' | 'customerId' | 'customerName' | 'createdAt' >>): Promise<Project> => {
    const projects = await listAllProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId && p.userId === userId);

    if (projectIndex === -1) {
        throw new Error('Project not found or access denied.');
    }

    // Uppdatera projektet med de nya värdena OCH sätt lastActivity automatiskt
    projects[projectIndex] = {
        ...projects[projectIndex],
        ...updates,
        lastActivity: new Date().toISOString(), // AUTOMATISK UPPDATERING!
    };

    await saveAllProjects(projects);
    return projects[projectIndex];
};

// Arkivera ett projekt
export const archiveProject = async (projectId: string, userId: string): Promise<void> => {
    const projects = await listAllProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId && p.userId === userId);

    if (projectIndex === -1) {
        throw new Error('Project not found or access denied.');
    }

    projects[projectIndex].archivedAt = new Date().toISOString();
    projects[projectIndex].lastActivity = new Date().toISOString(); // Uppdatera även här

    await saveAllProjects(projects);
};


// ----- KUNDRELATERADE PROJEKTUPPDATERINGAR -----

// När en kund uppdateras, se till att kundnamnet propageras till alla relevanta projekt
export const updateCustomerNameInProjects = async (userId: string, customerId: string, newCustomerName: string) => {
    const projects = await listAllProjects();
    let hasChanged = false;
    projects.forEach(project => {
        if (project.userId === userId && project.customerId === customerId) {
            project.customerName = newCustomerName;
            hasChanged = true;
        }
    });

    if (hasChanged) {
        await saveAllProjects(projects);
    }
};

// När en kund arkiveras, arkivera även alla deras aktiva projekt
export const archiveProjectsByCustomerId = async (userId: string, customerId: string) => {
     const projects = await listAllProjects();
     const now = new Date().toISOString();
     let hasChanged = false;

     projects.forEach(project => {
         if (project.userId === userId && project.customerId === customerId && !project.archivedAt) {
            project.archivedAt = now;
            project.lastActivity = now;
            hasChanged = true;
         }
     });

     if (hasChanged) {
         await saveAllProjects(projects);
     }
};
