
import { Timestamp } from 'firebase-admin/firestore';

// Baserat på projectSchema och databasanvändning
export type Project = {
  id: string;
  projectName: string;
  customerId: string;
  projectType: 'ROT' | 'FTG' | 'Annat';
  description?: string;
  userId: string;
  createdAt: Date | Timestamp;
  status: string;
};

// Generisk filtyp, baserat på addFileToProject-funktionen
export type File = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string; // t.ex. 'application/pdf'
  createdAt: Date | Timestamp;
};

// Baserat på getMaterialCosts-funktionen
export type Material = {
  id: string;
  projectId: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  price: number; // Beräknat: quantity * pricePerUnit
  date: Date | Timestamp;
  supplier?: string;
};

// Baserat på taskActions.ts
export type Task = {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    deadline?: Date | Timestamp;
    createdAt?: Date | Timestamp;
};

// Baserat på timeEntryActions.ts
export type TimeEntry = {
    id: string;
    projectId: string;
    userId: string;
    date: Date | Timestamp;
    hours: number;
    description?: string;
    isBilled: boolean;
};

// Baserat på timelogActions.ts
export type Timelog = {
    id: string;
    userId: string;
    projectId: string;
    taskId?: string;
    startTime: Date | Timestamp;
    endTime?: Date | Timestamp;
    status: 'running' | 'stopped';
    totalHours?: number;
};

// Baserat på userActions.ts
export type Company = {
    name: string;
    orgNumber: string;
    address: string;
    postalCode: string;
    city: string;
    phone: string;
};

export type CompanyFormData = {
  companyName: string;
  orgNumber: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
};
