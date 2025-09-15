export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  isCompany: boolean;
  createdAt: string; // ISO 8601 date string
  archivedAt: string | null; // ISO 8601 date string
}

export enum ProjectStatus {
  NotStarted = 'Ej påbörjat',
  InProgress = 'Pågående',
  OnHold = 'Pausat',
  Completed = 'Slutfört',
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  customerId: string;
  customerName: string; // Denormaliserad för enkel visning
  address: string | null;
  status: ProjectStatus;
  progress: number | null; // Procent, 0-100
  createdAt: string; // ISO 8601 date string
  lastActivity: string; // ISO 8601 date string
  deadline: string | null; // ISO 8601 date string. NYTT FÄLT!
  archivedAt: string | null; // ISO 8601 date string
}

export interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}
