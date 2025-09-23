
import { firestoreAdmin } from '@/app/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Project, Document, Message } from '@/app/types'; // Importera Message-typen

const db = firestoreAdmin;
const projectsCollection = db.collection('projects');

// ===============================================
// PROJEKT-FUNKTIONER
// ===============================================

export const createProjectInFirestore = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    // ... befintlig kod ...
    const now = FieldValue.serverTimestamp();
    const newProjectData = {
        ...projectData,
        createdAt: now,
        lastActivity: now,
        archivedAt: null,
        riskAnalysisJson: null,
    };
    const docRef = await projectsCollection.add(newProjectData);
    return { id: docRef.id, ...projectData };
};

export const getProjectFromFirestore = async (projectId: string): Promise<Project | null> => {
    // ... befintlig kod ...
    const doc = await projectsCollection.doc(projectId).get();
    if (!doc.exists) {
        return null;
    }
    const data = doc.data() as Omit<Project, 'id'>;
    return { id: doc.id, ...data };
};

export const updateProjectInFirestore = async (projectId: string, updates: Partial<Project>): Promise<void> => {
    // ... befintlig kod ...
    const updateData = {
        ...updates,
        lastActivity: FieldValue.serverTimestamp(),
    };
    await projectsCollection.doc(projectId).update(updateData);
};

// ===============================================
// DOKUMENT-FUNKTIONER
// ===============================================

export const addFileToProject = async (projectId: string, fileData: Document): Promise<void> => {
    // ... befintlig kod ...
    if (!projectId || !fileData || !fileData.id) {
        throw new Error('ProjectId och fileData med ett ID måste anges.');
    }
    const fileDocRef = projectsCollection.doc(projectId).collection('files').doc(fileData.id);
    await fileDocRef.set(fileData);
    await updateProjectInFirestore(projectId, {});
};

// ===============================================
// KOMMUNIKATIONS-FUNKTIONER (NYTT)
// ===============================================

/**
 * Hämtar alla meddelanden för ett projekt, sorterade efter tid.
 */
export const getMessagesForProject = async (projectId: string): Promise<Message[]> => {
    const messagesRef = projectsCollection.doc(projectId).collection('messages');
    const snapshot = await messagesRef.orderBy('timestamp', 'asc').get();
    
    if (snapshot.empty) {
        return [];
    }

    const messages: Message[] = [];
    snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...(doc.data() as Omit<Message, 'id'>) });
    });

    return messages;
};

/**
 * Lägger till ett nytt meddelande i ett projekt.
 */
export const addMessageToProject = async (projectId: string, messageData: Omit<Message, 'id'>): Promise<Message> => {
    const messagesRef = projectsCollection.doc(projectId).collection('messages');
    const docRef = await messagesRef.add(messageData);
    
    // Uppdatera projektets 'lastActivity' för att reflektera det nya meddelandet
    await updateProjectInFirestore(projectId, {}); 

    return { id: docRef.id, ...messageData };
};


// Exportera den primära databas-instansen
export { db };
