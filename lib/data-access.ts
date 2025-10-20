
import { adminDb } from './admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';
import logger from './logger';
import { Project, Invoice, Ata, Document, Chat, Message, Customer } from '@/types'; // Lade till Customer
import { v4 as uuidv4 } from 'uuid';

// =================================================================================
// DATA ACCESS LAYER (DAL) - GULDSTANDARD V3.1 (med Customer-funktioner)
// =================================================================================


// --- SESSION & SÄKERHET ---

async function verifyUserSession(traceId: string): Promise<string> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        logger.warn({ traceId }, "DAL: Session verification failed.");
        throw new Error("Unauthorized");
    }
    logger.info({ traceId, userId: session.user.id }, "DAL: Session verified.");
    return session.user.id;
}


// --- CHAT-FUNKTIONER (oförändrade) ---

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


// --- PROJEKT-FUNKTIONER (oförändrade) ---

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
        logger.error({ traceId, userId, error }, "Failed to get projects from Firestore.");
        throw new Error("Could not fetch projects.");
    }
}

export async function getProjectForUser(projectId: string): Promise<Project | null> {
    const traceId = uuidv4();
    const userId = await verifyUserSession(traceId);

    if (!projectId) {
        logger.warn({ traceId, userId }, "getProjectForUser called without projectId.");
        return null;
    }

    try {