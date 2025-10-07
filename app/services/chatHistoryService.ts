
'use server';

import { firestoreAdmin } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    timestamp: Timestamp;
}

export async function saveMessagesToHistory(userId: string, messages: Omit<ChatMessage, 'timestamp'>[]) {
    if (!userId) throw new Error('Användar-ID är obligatoriskt för att spara historik.');

    const chatHistoryRef = firestoreAdmin.collection('users').doc(userId).collection('chatHistory');
    const batch = firestoreAdmin.batch();

    messages.forEach(message => {
        const docRef = chatHistoryRef.doc();
        batch.set(docRef, { 
            ...message,
            timestamp: FieldValue.serverTimestamp() 
        });
    });

    try {
        await batch.commit();
        console.log(`[ChatHistory] Sparade ${messages.length} meddelande(n) för användare ${userId}.`);
        return { success: true };
    } catch (error) {
        console.error('[ChatHistory] Fel vid sparande av meddelanden:', error);
        return { success: false, error: 'Kunde inte spara meddelandehistorik.' };
    }
}

export async function getMessageHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    if (!userId) throw new Error('Användar-ID är obligatoriskt för att hämta historik.');

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
                ...data,
                // Konvertera Firestore Timestamp till ett serialiserbart format
                timestamp: data.timestamp.toDate(), 
            } as ChatMessage;
        }).reverse();

        return messages;

    } catch (error) {
        console.error('[ChatHistory] Fel vid hämtning av meddelanden:', error);
        return [];
    }
}
