
// ========================================================================
//  KÄRNTYPER FÖR PROJEKT & KUNDER
// ========================================================================

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
  deadline: string | null; // ISO 8601 date string
  archivedAt: string | null; // ISO 8601 date string
}

export enum TaskStatus {
  Todo = 'Att göra',
  InProgress = 'Pågående',
  Done = 'Klar',
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string; // ISO 8601 date string
  completedAt: string | null; // ISO 8601 date string
}

// ========================================================================
//  TYPER FÖR TIDRAPPORTERING (NY)
// ========================================================================

export enum TimeEntryStatus {
  Running = 'running',
  Paused = 'paused',
  Stopped = 'stopped',
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  status: TimeEntryStatus;
  startTime: string; // ISO 8601
  endTime: string | null; // ISO 8601
  duration: number; // Sekunder
  description: string | null;
  createdAt: string; // ISO 8601
}

// ========================================================================
//  TYPER FÖR FAKTURERING (Baserat på firestoreService.ts)
// ========================================================================

export enum InvoiceStatus {
  Draft = 'Utkast',
  Sent = 'Skickad',
  Paid = 'Betald',
  Overdue = 'Förfallen',
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string; // ISO 8601
  dueDate: string; // ISO 8601
  lines: InvoiceLine[];
  subtotal: number;
  vat: number; // Momsbelopp
  total: number;
  customerInfo: { // Denormaliserad kundinfo
    name: string;
    address: string;
    orgNr?: string;
  };
}

// ========================================================================
//  TYPER FÖR DOKUMENT & KOMMUNIKATION (Baserat på firestoreService.ts)
// ========================================================================

export interface Document {
  id: string;
  name: string;
  url: string; // Länk till fil i Google Cloud Storage e.d.
  type: string; // t.ex. 'Ritning', 'Besiktningsprotokoll'
  createdAt: string; // ISO 8601
  size: number; // i bytes
}

export interface Message {
  id: string;
  timestamp: string; // ISO 8601
  sender: 'user' | 'ai' | 'system';
  text: string;
}

// ========================================================================
//  ANVÄNDARE & EVENT-SYSTEM
// ========================================================================

export interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

export interface Event {
  id: string;
  date: string; 
  type: string; 
  title: string;
  description: string;
  iconName?: string;
  color?: string;
}

export interface ActionableEvent extends Event {
  actionType: 'PROJECT_LEAD' | 'INVOICE_PROCESSING' | 'UNKNOWN';
  suggestedNextStep: string;
  amount?: number;
  currency?: string;
  dueDate?: string | null;
  contact?: {
    name?: string | null;
    email?: string | null;
  };
}
