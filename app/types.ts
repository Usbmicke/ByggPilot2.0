
// Grundläggande typer för Kunder, Projekt, etc.

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
}

export interface Project {
    id: string;
    name: string;
    customerId: string;
    customerName: string;
    status: 'Pågående' | 'Anbud' | 'Avslutat';
    lastActivity: string;
    createdAt: string;
}

export interface TimeEntry {
    id: string;
    userId: string;
    projectId: string;
    projectName: string;
    customerName: string; // Denormalized for easy display
    date: string;
    hours: number;
    comment?: string;
    createdAt: string;
}

export interface Document {
    id: string;
    name: string;
    type: 'folder' | 'file';
    path: string;
    children?: Document[];
}

// ----- Typer för Chatt-komponenten -----

// Använder ett mer standardiserat format som är vanligt för AI-chattar.
export type ChatMessage = {
    id: string; // Unikt ID för React-rendering
    role: 'user' | 'assistant' | 'system';
    content: string;
};

// Den gamla enum och interfacet tas bort eller kommenteras ut.
/*
export enum MessageSender {
    AI,
    USER,
}

export interface ChatMessage {
    id: string;
    sender: MessageSender;
    text: string;
}
*/
