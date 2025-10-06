
'use server';

import { firestoreAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Definierar den förväntade strukturen för ett meddelande
interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    timestamp: FieldValue;
}

/**
 * Sparar ett enskilt meddelande eller ett par av meddelanden (användare + modell) till en konversation.
 * @param userId Användarens unika ID.
 * @param messages En array av meddelande-objekt som ska sparas.
 */
export async function saveMessagesToHistory(userId: string, messages: Omit<ChatMessage, 'timestamp'>[]) {
    if (!userId) throw new Error('Användar-ID är obligatoriskt för att spara historik.');

    const chatHistoryRef = firestoreAdmin.collection('users').doc(userId).collection('chatHistory');
    const batch = firestoreAdmin.batch();

    messages.forEach(message => {
        const docRef = chatHistoryRef.doc(); // Skapa ett nytt dokument för varje meddelande
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

/**
 * Hämtar de N senaste meddelandena från en användares konversationshistorik.
 * @param userId Användarens unika ID.
 * @param limit Antalet meddelanden att hämta.
 * @returns En array med de senaste meddelandena.
 */
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

        // Dokumenten hämtas i fallande ordning, så vi vänder på dem för att få korrekt kronologisk ordning
        const messages = snapshot.docs.map(doc => doc.data() as ChatMessage).reverse();
        return messages;

    } catch (error) {
        console.error('[ChatHistory] Fel vid hämtning av meddelanden:', error);
        return []; // Returnera en tom array vid fel för att undvika att appen kraschar
    }
}
