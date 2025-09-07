
// En gemensam källa för sanning gällande projektstatus.
// Detta förhindrar fel pga. stavfel eller olika system.
export enum ProjectStatus {
    QUOTE = 'Anbud',
    PLANNING = 'Planering',
    ONGOING = 'Pågående',
    COMPLETED = 'Avslutat',
    INVOICED = 'Fakturerat',
}

// Den kompletta och korrekta definitionen av ett Projekt-objekt.
// Alla delar av applikationen måste följa denna struktur.
export interface Project {
    id: string;
    name: string;
    customerId: string; // Google Contact ID (resourceName)
    customerName: string;
    status: ProjectStatus;
    driveFolderId?: string | null;
    address?: string; // Adress för väder etc.
    lat?: number;
    lon?: number;
    progress?: number; // Framsteg i procent (0-100)
    lastActivity: string; // ISO 8601 date string
    createdAt: string; // ISO 8601 date string
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
}

export interface TimeEntry {
    id: string;
    userId: string;
    projectId: string;
    projectName: string;
    customerName: string;
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

export type ChatMessage = {
    id: string; // Unikt ID för React-rendering
    role: 'user' | 'assistant' | 'system';
    content: string;
};
