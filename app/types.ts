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
  userId: string; // <-- TILLAGD
  name: string;
  email?: string;
  phone?: string;
  isCompany?: boolean;
  createdAt: string;
}

export interface Project {
  id: string; // Ändrat från 'string | number'
  userId: string; // <-- TILLAGD
  name: string;
  customerId: string;
  customerName?: string;
  status: ProjectStatus | string;
  progress?: number;
  driveFolderId?: string;
  address?: string;
  lastActivity: string;
  createdAt: string;
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
