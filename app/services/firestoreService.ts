
import { firestoreAdmin } from '@/app/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Project, Document, Message, Invoice, InvoiceLine } from '@/app/types';

const db = firestoreAdmin;
const projectsCollection = db.collection('projects');

// ===============================================
// PROJEKT-FUNKTIONER
// ===============================================

export const listProjectsForUserFromFirestore = async (userId: string): Promise<Project[]> => {
    const snapshot = await projectsCollection
        .where('ownerId', '==', userId)
        .where('archivedAt', '==', null)
        .orderBy('lastActivity', 'desc')
        .get();
    if (snapshot.empty) return [];
    const projects: Project[] = [];
    snapshot.forEach(doc => {
        projects.push({ id: doc.id, ...(doc.data() as Omit<Project, 'id'>) });
    });
    return projects;
};

export const createProjectInFirestore = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const now = FieldValue.serverTimestamp();
    const newProjectData = { ...projectData, createdAt: now, lastActivity: now, archivedAt: null, riskAnalysisJson: null };
    const docRef = await projectsCollection.add(newProjectData);
    return { id: docRef.id, ...projectData };
};

export const getProjectFromFirestore = async (projectId: string): Promise<Project | null> => {
    const doc = await projectsCollection.doc(projectId).get();
    if (!doc.exists) return null;
    const data = doc.data() as Omit<Project, 'id'>;
    if (data.archivedAt) return null;
    return { id: doc.id, ...data };
};

export const updateProjectInFirestore = async (projectId: string, updates: Partial<Project>): Promise<void> => {
    const updateData = { ...updates, lastActivity: FieldValue.serverTimestamp() };
    await projectsCollection.doc(projectId).update(updateData);
};

export const archiveProjectInFirestore = async (projectId: string): Promise<void> => {
    const now = FieldValue.serverTimestamp();
    await projectsCollection.doc(projectId).update({ archivedAt: now, lastActivity: now });
};

// ===============================================
// FAKTURA-FUNKTIONER (NYTT)
// ===============================================

export const createInvoiceInFirestore = async (projectId: string, invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> => {
    const invoicesRef = projectsCollection.doc(projectId).collection('invoices');
    const docRef = await invoicesRef.add(invoiceData);
    await updateProjectInFirestore(projectId, {}); // Uppdatera projektets lastActivity
    return { id: docRef.id, ...invoiceData };
};

export const getInvoicesForProject = async (projectId: string): Promise<Invoice[]> => {
    const snapshot = await projectsCollection.doc(projectId).collection('invoices').orderBy('issueDate', 'desc').get();
    if (snapshot.empty) return [];
    const invoices: Invoice[] = [];
    snapshot.forEach(doc => {
        invoices.push({ id: doc.id, ...(doc.data() as Omit<Invoice, 'id'>) });
    });
    return invoices;
};

export const getInvoiceFromFirestore = async (projectId: string, invoiceId: string): Promise<Invoice | null> => {
    const doc = await projectsCollection.doc(projectId).collection('invoices').doc(invoiceId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Omit<Invoice, 'id'>) };
};

export const updateInvoiceStatusInFirestore = async (projectId: string, invoiceId: string, status: 'Utkast' | 'Skickad' | 'Betald'): Promise<void> => {
    const invoiceRef = projectsCollection.doc(projectId).collection('invoices').doc(invoiceId);
    await invoiceRef.update({ status: status });
    await updateProjectInFirestore(projectId, {}); // Uppdatera projektets lastActivity
};


// ===============================================
// DOKUMENT-FUNKTIONER
// ===============================================

export const addFileToProject = async (projectId: string, fileData: Document): Promise<void> => {
    if (!projectId || !fileData || !fileData.id) throw new Error('ProjectId och fileData med ett ID måste anges.');
    const fileDocRef = projectsCollection.doc(projectId).collection('files').doc(fileData.id);
    await fileDocRef.set(fileData);
    await updateProjectInFirestore(projectId, {});
};

// ===============================================
// KOMMUNIKATIONS-FUNKTIONER
// ===============================================

export const getMessagesForProject = async (projectId: string): Promise<Message[]> => {
    const messagesRef = projectsCollection.doc(projectId).collection('messages');
    const snapshot = await messagesRef.orderBy('timestamp', 'asc').get();
    if (snapshot.empty) return [];
    const messages: Message[] = [];
    snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...(doc.data() as Omit<Message, 'id'>) });
    });
    return messages;
};

export const addMessageToProject = async (projectId: string, messageData: Omit<Message, 'id'>): Promise<Message> => {
    const messagesRef = projectsCollection.doc(projectId).collection('messages');
    const docRef = await messagesRef.add(messageData);
    await updateProjectInFirestore(projectId, {}); 
    return { id: docRef.id, ...messageData };
};


// Exportera den primära databas-instansen
export { db };
