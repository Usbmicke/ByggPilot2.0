
'use server';

import { firestoreAdmin } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// =================================================================================
// GULD STANDARD - CHAT HISTORY SERVICE
// Version 10.0 - Holistisk Renovering: Robust Databas-interaktion.
// =================================================================================

interface ChatHistoryEntry {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface ChatMessageInDb extends ChatHistoryEntry {
    timestamp: Timestamp;
}

export async function saveMessagesToHistory(userId: string, messages: ChatHistoryEntry[]) {
    // =============================================================================
    // KRITISK VALIDERING: Förhindra datakorruption.
    // Acceptera aldrig null, undefined, eller tomma meddelandelistor.
    // =============================================================================
    if (!userId) {
        console.error('[saveMessagesToHistory] Avbrutet: Användar-ID saknas.');
        return { success: false, error: 'Användar-ID är obligatoriskt.' };
    }

    if (!messages || messages.length === 0) {
        console.error('[saveMessagesToHistory] Avbrutet: Inga meddelanden att spara.');
        return { success: false, error: 'Meddelandelistan kan inte vara tom.' };
    }

    const chatHistoryRef = firestoreAdmin.collection('users').doc(userId).collection('chatHistory');
    const batch = firestoreAdmin.batch();

    for (const message of messages) {
        // Ytterligare validering för varje enskilt meddelande.
        const messageContent = message.parts[0]?.text?.trim();
        if (!messageContent) {
            console.warn('[saveMessagesToHistory] Hoppar över tomt meddelande.', message);
            continue; // Hoppa över och spara inte detta ogiltiga meddelande.
        }

        const docRef = chatHistoryRef.doc();
        const messageWithTimestamp: ChatMessageInDb = {
            ...message,
            timestamp: FieldValue.serverTimestamp() as Timestamp,
        };
        batch.set(docRef, messageWithTimestamp);
    }

    try {
        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error('[saveMessagesToHistory] Fel vid batch commit:', error);
        return { success: false, error: 'Kunde inte spara meddelandehistorik till databasen.' };
    }
}

// Funktion för att hämta historik, oförändrad men drar nytta av den högre datakvaliteten.
export async function getMessageHistory(userId: string, limit: number = 50): Promise<ChatHistoryEntry[]> {
    if (!userId) {
        console.error('[getMessageHistory] Användar-ID saknas.');
        return [];
    }

    try {
        const snapshot = await firestoreAdmin
            .collection('users').doc(userId).collection('chatHistory')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        if (snapshot.empty) {
            return [];
        }

        const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                role: data.role,
                parts: data.parts
            } as ChatHistoryEntry;
        }).reverse();
        
        return messages;

    } catch (error) {
        console.error('[getMessageHistory] Fel vid hämtning av historik:', error);
        return [];
    }
}
