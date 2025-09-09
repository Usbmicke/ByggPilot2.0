
// ====== Generella Typer ======

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ====== Databas-nära Typer ======

export enum ProjectStatus {
  QUOTE = 'Anbud',
  PLANNING = 'Planering',
  ONGOING = 'Pågående',
  COMPLETED = 'Avslutat',
  INVOICED = 'Fakturerat',
}

export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isCompany?: boolean;
  createdAt: string; // Tillagt för att matcha demo-data och god praxis
}

export interface Project {
  id: string | number; // Kan vara nummer i demo, string från DB
  name: string;
  customerId: string;
  customerName?: string; // Cachelagrat kundnamn för enklare visning
  status: ProjectStatus | string; // Tillåter string för flexibilitet med demo-data
  progress?: number;
  driveFolderId?: string;
  address?: string;
  lastActivity: string; // Datum för senaste aktivitet (ISO-sträng)
  createdAt: string; // När projektet skapades (ISO-sträng)
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// NYTT: Definition för tidrapporter
export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  customerName: string;
  date: string;
  hours: number;
  comment: string;
  createdAt: string;
}

// NYTT: Rekursiv definition för dokument och mappar
export interface Document {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  children?: Document[];
}
