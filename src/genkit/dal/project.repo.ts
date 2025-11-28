
import 'server-only';
import { firestore } from '../firebase';
import { Firestore, CollectionReference, DocumentData, QueryDocumentSnapshot, FirestoreDataConverter } from 'firebase-admin/firestore';

// ===================================================================
// Project Data Model
// ===================================================================

export interface Project {
  id: string;
  name: string;
  ownerId: string; // UID of the user who owns the project
  description?: string;
  createdAt: Date;
  // Senare kan vi lägga till fler fält som 'updatedAt', 'files', etc.
}

// ===================================================================
// Firestore Converter for Projects
// ===================================================================

const projectConverter: FirestoreDataConverter<Project> = {
  toFirestore(project: Project): DocumentData {
    return {
      name: project.name,
      ownerId: project.ownerId,
      description: project.description,
      createdAt: project.createdAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Project {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      ownerId: data.ownerId,
      description: data.description,
      createdAt: data.createdAt.toDate(),
    };
  },
};


// ===================================================================
// Project Repository
// ===================================================================
// Hanterar all databaslogik för projekt.
// ===================================================================

class ProjectRepository {
  private readonly collection: CollectionReference<Project>;

  constructor(db: Firestore) {
    this.collection = db.collection('projects').withConverter(projectConverter);
  }

  /**
   * Hämtar alla projekt som ägs av en specifik användare.
   * @param ownerId Användarens UID.
   * @returns En lista med projekt.
   */
  async findAllByOwner(ownerId: string): Promise<Project[]> {
    const snapshot = await this.collection.where('ownerId', '==', ownerId).get();
    return snapshot.docs.map(doc => doc.data());
  }

  /**
   * Skapar de grundläggande mapparna för en ny användare.
   * Denna metod är IDEMPOTENT: den kommer inte att skapa mappar om de redan finns.
   * Använder en Firestore-batch för att säkerställa att alla operationer lyckas eller misslyckas tillsammans.
   * @param ownerId Användarens UID.
   */
  async createDefaultFolders(ownerId: string): Promise<void> {
    const batch = firestore.batch();

    const defaultFolders = [
      { name: '/', description: 'Root directory for your projects.' },
      { name: '/shared', description: 'Shared with you by others.' },
      { name: '/ai-chats', description: 'Your conversations with AI.' },
    ];

    console.log(`Creating default folders for user: ${ownerId}`);

    for (const folder of defaultFolders) {
      // Vi måste först kontrollera om en mapp med samma namn och ägare redan finns
      // för att uppnå idempotens. Firestore batchar stöder inte läsoperationer,
      // så vi måste göra detta utanför batchen.
      const query = this.collection.where('ownerId', '==', ownerId).where('name', '==', folder.name);
      const existing = await query.get();

      if (existing.empty) {
        const docRef = this.collection.doc(); // Skapa en ny dokumentreferens
        const newProject: Project = {
          id: docRef.id,
          ownerId,
          name: folder.name,
          description: folder.description,
          createdAt: new Date(),
        };
        batch.set(docRef, newProject);
        console.log(`  - Adding folder '${folder.name}' to batch.`);
      } else {
        console.log(`  - Folder '${folder.name}' already exists. Skipping.`);
      }
    }

    await batch.commit();
    console.log('Batch commit successful. Default folders ensured.');
  }
}

// Exportera en singleton-instans
export const projectRepo = new ProjectRepository(firestore);
