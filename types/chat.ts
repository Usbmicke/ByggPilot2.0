
// =================================================================================
// CHAT TYPES V1.0
// BESKRIVNING: Denna fil centraliserar alla typer som används i chatt-flödet.
// Att använda strikta typer istället för `any` gör koden säkrare, enklare att
// läsa och minskar risken för buggar vid framtida ändringar. Steg 2.2 i planen.
// =================================================================================

// Definierar rollen i en konversation
export type MessageRole = 'user' | 'assistant';

// Definierar ett enskilt meddelande i Vercel AI SDK-format
export interface VercelMessage {
    role: MessageRole;
    content: string;
}

// Definierar formatet som Google Gemini API förväntar sig för historik
export interface GeminiHistoryPart {
    text: string;
}

export interface GeminiHistoryEntry {
    role: MessageRole;
    parts: GeminiHistoryPart[];
}
