
// Denna fil innehåller globala TypeScript-typer för projektet.
// För databas-scheman (Zod), se katalogen src/lib/schemas.

// Exempel på en global typ:
export type Status = 'pending' | 'active' | 'archived';

// Typ för ett chattmeddelande, används i frontend och backend.
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  toolInvocations?: ToolInvocation[];
  toolResults?: ToolResult[];
  isOptimistic?: boolean;
}

export interface ToolInvocation {
  toolName: string;
  args: any;
}

export interface ToolResult {
  toolName: string;
  result: any;
}

export enum ProjectStatus {
    Active = 'Aktivt',
    Paused = 'Pausat',
    Completed = 'Slutfört',
    Archived = 'Arkiverat'
}

export interface Project {
    id: string;
    projectName: string;
    customerName?: string;
    status: ProjectStatus;
    createdAt: Date;
    totalCost?: number;
    totalHours?: number;
}

export interface Material {
    id: string;
    projectId: string;
    name: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    price: number;
    date: any; // acac
    supplier?: string;
}

export interface Task {
    id: string;
    projectId: string;
    description: string;
    completed: boolean;
    createdAt: Date;
}

export interface TimeEntry {
    id: string;
    taskId?: string;
    projectId: string;
    startTime: Date;
    endTime: Date | null;
    duration: number; // in hours
    notes?: string;
    isRunning?: boolean;
}

export interface UserProfile {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    company?: {
        name?: string;
        vision?: string;
        hourlyRate?: number;
    };
    hasCompletedOnboarding?: boolean;
    driveRootFolderId?: string;
    driveRootFolderUrl?: string;
}

export type User = UserProfile;

export interface EnrichedSession {
    user?: UserProfile & {
        id: string;
    }
}
