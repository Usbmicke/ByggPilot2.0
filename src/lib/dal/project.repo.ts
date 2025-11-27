import 'server-only';
import { firestore } from '../firebase/server';
import { Project, projectSchema } from '@/lib/schemas/project.schema'; // Importera från den nya, säkra platsen

// Vårt Project Repository
export const projectRepo = {
  async get(id: string): Promise<Project | null> {
    const doc = await firestore.collection('projects').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    // Validera data mot schemat vid läsning
    return projectSchema.parse({ id: doc.id, ...doc.data() });
  },

  async create(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const newProjectRef = firestore.collection('projects').doc();
    const newProjectData = {
      ...project,
      createdAt: new Date(),
    };
    
    // Skapa det fullständiga objektet för att kunna returnera det
    const fullProject: Project = {
        id: newProjectRef.id,
        ...newProjectData,
    };

    await newProjectRef.set({
        ...newProjectData,
        createdAt: newProjectData.createdAt.toISOString(), // Spara som ISO-sträng
    });
    return fullProject;
  },

  async update(id: string, data: Partial<Omit<Project, 'id'>>): Promise<void> {
    await firestore.collection('projects').doc(id).update(data);
  },

  async delete(id: string): Promise<void> {
    await firestore.collection('projects').doc(id).delete();
  },

  async listByOwner(ownerId: string): Promise<Project[]> {
    const snapshot = await firestore.collection('projects').where('ownerId', '==', ownerId).get();
    // Validera varje dokument mot schemat
    return snapshot.docs.map(doc => projectSchema.parse({ id: doc.id, ...doc.data() }));
  },
};
