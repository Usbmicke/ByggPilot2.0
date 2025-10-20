
import { adminDb } from './admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';
import logger from './logger';
import { Project, Invoice, Ata, Document, Chat, Message, Customer, Task, TimeEntry, TimeEntryStatus, ProjectStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// =================================================================================
// DATA ACCESS LAYER (DAL) - GULDSTANDARD V4.6
// =================================================================================

// --- SESSION & SECURITY ---

async function verifyUserSession(traceId: string): Promise<string> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        logger.warn({ traceId }, "DAL: Session verification failed.");
        throw new Error("Unauthorized");
    }
    logger.info({ traceId, userId: session.user.id }, "DAL: Session verified.");
    return session.user.id;
}

// --- TIME ENTRY FUNCTIONS ---

export async function getActiveTimeEntry(): Promise<TimeEntry | null> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    try {
        const timeEntriesRef = adminDb.collection('users').doc(userId).collection('time-entries');
        const runningTimerQuery = await timeEntriesRef
            .where('status', '==', TimeEntryStatus.Running)
            .limit(1)
            .get();

        if (runningTimerQuery.empty) {
            logger.info({ traceId, userId }, "DAL: No active time entry found for user.");
            return null;
        }

        const timerDoc = runningTimerQuery.docs[0];
        const activeTimer = { id: timerDoc.id, ...timerDoc.data() } as TimeEntry;

        logger.info({ traceId, userId, timeEntryId: activeTimer.id }, "DAL: Active time entry retrieved successfully.");
        return JSON.parse(JSON.stringify(activeTimer));

    } catch (error) {
        logger.error({ traceId, userId, error }, "DAL: Failed to get active time entry.");
        throw new Error("Could not fetch active time entry.");
    }
}

export async function startTimeEntry(projectId: string): Promise<TimeEntry> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    try {
        if (!projectId) {
            throw new Error("Project ID is required to start a time entry.");
        }
        
        const timeEntriesRef = adminDb.collection('users').doc(userId).collection('time-entries');
        const runningTimersQuery = await timeEntriesRef.where('status', '==', TimeEntryStatus.Running).get();
        
        if (!runningTimersQuery.isEmpty) {
            logger.warn({ traceId, userId }, "DAL: User tried to start a new timer while another was running. Stopping old timers.");
            const batch = adminDb.batch();
            runningTimersQuery.docs.forEach(doc => {
                batch.update(doc.ref, { status: TimeEntryStatus.Stopped, endTime: new Date().toISOString() });
            });
            await batch.commit();
        }

        const newTimeEntryRef = timeEntriesRef.doc();
        const newTimeEntry: TimeEntry = {
            id: newTimeEntryRef.id,
            userId,
            projectId,
            status: TimeEntryStatus.Running,
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            description: null,
            createdAt: new Date().toISOString(),
        };

        await newTimeEntryRef.set(newTimeEntry);
        logger.info({ traceId, userId, projectId, timeEntryId: newTimeEntry.id }, "DAL: Time entry started successfully.");
        
        return JSON.parse(JSON.stringify(newTimeEntry));

    } catch (error) {
        logger.error({ traceId, userId, projectId, error }, "DAL: Failed to start time entry.");
        throw new Error("Could not start time entry.");
    }
}

export async function stopActiveTimeEntry(): Promise<TimeEntry> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    try {
        const timeEntriesRef = adminDb.collection('users').doc(userId).collection('time-entries');
        const runningTimerQuery = await timeEntriesRef.where('status', '==', TimeEntryStatus.Running).limit(1).get();

        if (runningTimerQuery.isEmpty) {
            throw new Error("No running timer found to stop.");
        }

        const timerDoc = runningTimerQuery.docs[0];
        const startTime = new Date(timerDoc.data().startTime).getTime();
        const endTime = new Date().getTime();
        const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds

        const updatedData = {
            status: TimeEntryStatus.Stopped,
            endTime: new Date(endTime).toISOString(),
            duration: duration,
        };

        await timerDoc.ref.update(updatedData);
        logger.info({ traceId, userId, timeEntryId: timerDoc.id }, "DAL: Active time entry stopped successfully.");

        const updatedDoc = await timerDoc.ref.get();
        return JSON.parse(JSON.stringify({ id: updatedDoc.id, ...updatedDoc.data() }));

    } catch (error) {
        logger.error({ traceId, userId, error }, "DAL: Failed to stop time entry.");
        throw new Error("Could not stop time entry.");
    }
}


// --- TASK FUNCTIONS ---

export async function getTasksForProject(projectId: string): Promise<Task[]> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    try {
        const projectRef = adminDb.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectDoc = await projectRef.get();
        if (!projectDoc.exists) {
            logger.warn({ traceId, userId, projectId }, "DAL: User attempted to access tasks for a non-existent or unauthorized project.");
            throw new Error("Project not found or user lacks access.");
        }

        const tasksSnapshot = await adminDb.collection('users').doc(userId).collection('tasks')
            .where('projectId', '==', projectId)
            .orderBy('createdAt', 'asc')
            .get();

        if (tasksSnapshot.empty) {
            return [];
        }

        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Task);
        logger.info({ traceId, userId, projectId, taskCount: tasks.length }, "DAL: Tasks retrieved successfully for project.");
        return JSON.parse(JSON.stringify(tasks));

    } catch (error) {
        logger.error({ traceId, userId, projectId, error }, "DAL: Failed to get tasks for project.");
        throw new Error("Could not fetch tasks.");
    }
}

export async function createTask(taskData: { text: string; projectId: string; }): Promise<Task> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    const { text, projectId } = taskData;

    try {
        if (!text || !projectId) {
            throw new Error("Task text and projectId are required.");
        }
        
        const projectRef = adminDb.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectDoc = await projectRef.get();
        if (!projectDoc.exists) {
            logger.warn({ traceId, userId, projectId }, "DAL: User attempted to create a task for a non-existent or unauthorized project.");
            throw new Error("Project not found or user lacks access.");
        }

        const newTaskRef = adminDb.collection('users').doc(userId).collection('tasks').doc();
        const newTask: any = {
            id: newTaskRef.id,
            text,
            projectId,
            completed: false,
            createdAt: new Date().toISOString(),
            userId: userId,
        };

        await newTaskRef.set(newTask);
        logger.info({ traceId, userId, projectId, taskId: newTask.id }, "DAL: Task created successfully.");

        return JSON.parse(JSON.stringify(newTask));

    } catch (error) {
        logger.error({ traceId, userId, taskData, error }, "DAL: Failed to create task.");
        throw new Error("Could not create task.");
    }
}


// --- CHAT FUNCTIONS ---

export async function createChat(userId: string, firstUserMessage: any): Promise<string> {
    const traceId = uuidv4();
    const verifiedUserId = await verifyUserSession(traceId);
    if (userId !== verifiedUserId) throw new Error("Mismatched user ID");

    const chatId = uuidv4();
    const chatRef = adminDb.collection('users').doc(userId).collection('chats').doc(chatId);
    
    await chatRef.set({
        id: chatId,
        createdAt: new Date().toISOString(),
        title: firstUserMessage.content.substring(0, 30),
    });

    await addMessageToChat(userId, chatId, firstUserMessage);
    
    logger.info({ traceId, userId, chatId }, "New chat created.");
    return chatId;
}

export async function addMessageToChat(userId: string, chatId: string, message: { role: 'user' | 'assistant'; content: string; }) {
    const traceId = uuidv4();
    const verifiedUserId = await verifyUserSession(traceId);
     if (userId !== verifiedUserId) throw new Error("Mismatched user ID");

    const messageId = uuidv4();
    const messageRef = adminDb.collection('users').doc(userId).collection('chats').doc(chatId).collection('messages').doc(messageId);
    
    await messageRef.set({
        id: messageId,
        ...message,
        createdAt: new Date().toISOString(),
    });
    logger.info({ traceId, userId, chatId, messageId }, "Message added to chat.");
}

export async function getChatMessages(userId: string, chatId: string): Promise<Message[]> {
    const traceId = uuidv4();
    const verifiedUserId = await verifyUserSession(traceId);
    if (userId !== verifiedUserId) throw new Error("Mismatched user ID");

    const messagesSnapshot = await adminDb.collection('users').doc(userId).collection('chats').doc(chatId).collection('messages').orderBy('createdAt', 'asc').get();
    
    const messages = messagesSnapshot.docs.map(doc => doc.data() as Message);
    logger.info({ traceId, userId, chatId, messageCount: messages.length }, "Chat messages retrieved.");
    return messages;
}


// --- PROJECT FUNCTIONS ---

export async function getProjectsForUser(): Promise<Project[]> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);
    
    try {
        const projectsSnapshot = await adminDb.collection('users').doc(userId).collection('projects').orderBy('createdAt', 'desc').get();
        if (projectsSnapshot.empty) {
            return [];
        }
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Project);
        return JSON.parse(JSON.stringify(projects));
    } catch (error) {
        logger.error({ traceId, userId, error }, "DAL: Failed to get projects from Firestore.");
        throw new Error("Could not fetch projects.");
    }
}

export async function getProjectForUser(projectId: string): Promise<Project | null> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    if (!projectId) {
        logger.warn({ traceId, userId }, "DAL: getProjectForUser called without projectId.");
        return null;
    }

    try {
        const projectRef = adminDb.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();

        if (!projectSnap.exists) {
            logger.warn({ traceId, userId, projectId }, "DAL: Project not found or user lacks access.");
            return null;
        }

        const project = { id: projectSnap.id, ...projectSnap.data() } as Project;
        return JSON.parse(JSON.stringify(project));

    } catch (error) {
        logger.error({ traceId, userId, projectId, error }, "DAL: Failed to get project from Firestore.");
        throw new Error("Could not fetch project.");
    }
}

export async function createProject(projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    const { name, ...rest } = projectData;

    try {
        const newProjectRef = adminDb.collection('users').doc(userId).collection('projects').doc();
        const newProject: Project = {
            id: newProjectRef.id,
            userId,
            name,
            ...rest,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
        };

        await newProjectRef.set(newProject);
        logger.info({ traceId, userId, projectId: newProject.id }, "DAL: Project created successfully.");

        return JSON.parse(JSON.stringify(newProject));

    } catch (error) {
        logger.error({ traceId, userId, projectData, error }, "DAL: Failed to create project.");
        throw new Error("Could not create project.");
    }
}


// --- INVOICE FUNCTIONS ---

export async function createInvoice(invoiceData: any): Promise<Invoice> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    try {
        const { projectId, lines } = invoiceData;
        if (!projectId || !lines || !Array.isArray(lines) || lines.length === 0) {
            throw new Error("Invalid invoice data provided.");
        }

        const projectRef = adminDb.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();

        if (!projectSnap.exists) {
            logger.warn({ traceId, userId, projectId }, "DAL: Attempted to create invoice for non-existent or inaccessible project.");
            throw new Error("Project not found or user lacks access.");
        }

        const batch = adminDb.batch();
        const totalAmount = lines.reduce((acc: number, line: { quantity: number; unitPrice: number; }) => acc + (line.quantity * line.unitPrice), 0);
        const invoiceDocRef = projectRef.collection('invoices').doc();

        const newInvoice: Omit<Invoice, 'id'> = {
            ...invoiceData,
            status: 'draft',
            totalAmount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        batch.set(invoiceDocRef, newInvoice);

        const currentInvoiced = projectSnap.data()?.totalInvoiced || 0;
        batch.update(projectRef, { totalInvoiced: currentInvoiced + totalAmount });

        await batch.commit();

        logger.info({ traceId, userId, projectId, invoiceId: invoiceDocRef.id }, "DAL: Invoice created successfully.");

        const result: Invoice = { ...newInvoice, id: invoiceDocRef.id };
        return JSON.parse(JSON.stringify(result));

    } catch (error) {
        logger.error({ traceId, userId, invoiceData, error }, "DAL: Failed to create invoice.");
        throw new Error("Could not create the invoice.");
    }
}

export async function getInvoicesForProject(projectId: string): Promise<Invoice[]> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);
    try {
        const invoicesSnapshot = await adminDb.collection('users').doc(userId).collection('projects').doc(projectId).collection('invoices').orderBy('createdAt', 'desc').get();
        if (invoicesSnapshot.empty) return [];
        const invoices = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Invoice);
        return JSON.parse(JSON.stringify(invoices));
    } catch (error) {
        logger.error({ traceId, userId, projectId, error }, "DAL: Failed to get invoices for project.");
        throw new Error("Could not fetch invoices.");
    }
}


// --- ATA FUNCTIONS ---

export async function getAtasForProject(projectId: string): Promise<Ata[]> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);
    try {
        const atasSnapshot = await adminDb.collection('users').doc(userId).collection('projects').doc(projectId).collection('atas').orderBy('createdAt', 'desc').get();
        if (atasSnapshot.empty) return [];
        const atas = atasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Ata);
        return JSON.parse(JSON.stringify(atas));
    } catch (error) {
        logger.error({ traceId, userId, projectId, error }, "DAL: Failed to get ATAs for project.");
        throw new Error("Could not fetch ATAs.");
    }
}


// --- DOCUMENT FUNCTIONS ---

export async function getDocumentsForProject(projectId: string): Promise<Document[]> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);
    try {
        const docsSnapshot = await adminDb.collection('users').doc(userId).collection('projects').doc(projectId).collection('documents').orderBy('createdAt', 'desc').get();
        if (docsSnapshot.empty) return [];
        const documents = docsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Document);
        return JSON.parse(JSON.stringify(documents));
    } catch (error) {
        logger.error({ traceId, userId, projectId, error }, "DAL: Failed to get documents for project.");
        throw new Error("Could not fetch documents.");
    }
}


// --- CUSTOMER FUNCTIONS ---

export async function getCustomersForUser(): Promise<Customer[]> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);
    try {
        const customersSnapshot = await adminDb.collection('users').doc(userId).collection('customers').orderBy('name', 'asc').get();
        if (customersSnapshot.empty) return [];
        const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Customer);
        return JSON.parse(JSON.stringify(customers));
    } catch (error) {
        logger.error({ traceId, userId, error }, "DAL: Failed to get customers for user.");
        throw new Error("Could not fetch customers.");
    }
}

export async function getCustomerForUser(customerId: string): Promise<Customer | null> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    if (!customerId) {
        logger.warn({ traceId, userId }, "DAL: getCustomerForUser called without customerId.");
        return null;
    }

    try {
        const customerRef = adminDb.collection('users').doc(userId).collection('customers').doc(customerId);
        const doc = await customerRef.get();

        if (!doc.exists) {
            logger.warn({ traceId, userId, customerId }, "DAL: Customer not found or user lacks access.");
            return null;
        }

        const customer = { id: doc.id, ...doc.data() } as Customer;
        return JSON.parse(JSON.stringify(customer));

    } catch (error) {
        logger.error({ traceId, userId, customerId, error }, "DAL: Failed to get customer from Firestore.");
        throw new Error("Could not fetch customer.");
    }
}

export async function createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);
    try {
        if (!customerData.name) {
            throw new Error("Customer name is required.");
        }

        const customerRef = adminDb.collection('users').doc(userId).collection('customers').doc();
        const newCustomer: any = {
            id: customerRef.id,
            ...customerData,
            createdAt: new Date().toISOString(),
            updatedAt: new D ate().toISOString(),
        };

        await customerRef.set(newCustomer);
        logger.info({ traceId, userId, customerId: newCustomer.id }, "DAL: Customer created successfully.");

        return newCustomer as Customer;

    } catch (error) {
        logger.error({ traceId, userId, customerData, error }, "DAL: Failed to create customer.");
        throw new Error("Could not create customer.");
    }
}

export async function updateCustomer(customerId: string, data: Partial<Customer>): Promise<Customer> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    try {
        const customerRef = adminDb.collection('users').doc(userId).collection('customers').doc(customerId);
        const doc = await customerRef.get();

        if (!doc.exists) {
            throw new Error("Customer not found.");
        }

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
        };

        await customerRef.update(updateData);
        logger.info({ traceId, userId, customerId }, "DAL: Customer updated successfully.");

        const updatedDoc = await customerRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() } as Customer;

    } catch (error) {
        logger.error({ traceId, userId, customerId, data, error }, "DAL: Failed to update customer.");
        throw new Error("Could not update customer.");
    }
}

export async function archiveCustomer(customerId: string): Promise<void> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    try {
        const customerRef = adminDb.collection('users').doc(userId).collection('customers').doc(customerId);
        const doc = await customerRef.get();

        if (!doc.exists) {
            throw new Error("Customer not found.");
        }

        await customerRef.update({ archived: true, updatedAt: new Date().toISOString() });
        logger.info({ traceId, userId, customerId }, "DAL: Customer archived successfully.");

    } catch (error) {
        logger.error({ traceId, userId, customerId, error }, "DAL: Failed to archive customer.");
        throw new Error("Could not archive customer.");
    }
}
