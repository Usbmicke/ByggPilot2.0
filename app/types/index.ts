
// =====================================================================================
// CENTRALISERAD TYP-FIL FÖR HELA APPLIKATIONEN
// Världsklasskodning kräver typ-säkerhet. Denna fil är den enda källan för sanning.
// =====================================================================================

import { Timestamp } from 'firebase-admin/firestore';

// ----------------------------------------
// KÄRN-ENTITETER
// ----------------------------------------

export interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt?: Timestamp | any;
  isNewUser?: boolean;
  termsAccepted?: boolean;
  onboardingComplete?: boolean;
  companyId?: string | null;
  companyName?: string | null;
  companyVision?: string;
}

export type User = UserProfile;

/** Kund (Företag eller Privatperson). */
export interface Customer {
  id: string;
  name: string; 
  customerType: 'Company' | 'PrivatePerson' | 'company' | 'private' | null;
  email: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  companyName?: string;
  orgNumber?: string;
  referencePerson?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Timestamp | any;
}

/** Projektstatus - en kritisk del av projekt-livscykeln. */
export type ProjectStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Archived' | 'Anbud' | 'Pågående' | 'Arkiverat';

/** Huvudprojektet som binder samman allt. */
export interface Project {
  id: string;
  projectName: string; 
  customerId: string;
  customerName: string; 
  clientName?: string; 
  status: ProjectStatus;
  startDate?: Timestamp | any;
  endDate?: Timestamp | any;
  description?: string;
  totalInvoiced?: number;
  totalCost?: number;
  lastActivity?: string | Timestamp | any;
  createdAt: Timestamp | any;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  deadline?: Timestamp | any;
}

export interface Material {
  id: string;
  projectId: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  price: number;
  date: Timestamp | any;
  supplier?: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: Timestamp | any;
  endTime: Timestamp | any;
  description?: string;
}

export interface File {
  id: string;
  projectId: string;
  name: string;
  url: string;
  uploadedAt: Timestamp | any;
}

export type AtaStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Ata {
  id:string;
  projectId: string;
  title: string;
  description: string;
  price: number;
  notes?: string; 
  status: AtaStatus; 
  isApproved: boolean;
  createdAt: Timestamp | any;
}

// ----------------------------------------
// FAKTURERING & EKONOMI
// ----------------------------------------

export interface RotDeduction {
  isApplicable: boolean;
  laborCost: number;
  amount: number;
  personNumber?: string;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  invoiceLines: InvoiceLine[];
  rotDeduction: RotDeduction;
  totalAmount: number;
  customer: Customer;
  issueDate: Timestamp | any;
  dueDate: Timestamp | any;
  createdAt: Timestamp | any;
}

export type InvoiceCreationData = Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'createdAt' | 'totalAmount'>;

export interface Calculation {
  id: string;
  projectId: string;
  totalMaterialCost: number;
  totalLaborCost: number;
  otherCosts: number;
  totalEstimatedCost: number;
}

// ----------------------------------------
// INTERAKTION & GRÄNSSNITT
// ----------------------------------------

// VÄRLDSKLASS-ARKITEKTUR: En enhetlig händelsetyp för hela systemet.
export type EventType = 'new_task' | 'invoice_due' | 'project_approved' | 'new_message' | 'Tip' | 'log';

export interface ActionableEvent {
  id: string;
  type: EventType;
  title?: string; // Valfri, eftersom en logg inte har en titel.
  description?: string; // Valfri, används för detaljer.
  message?: string; // Valfri, specifikt för loggmeddelanden.
  link?: string; // Valfri, eftersom en logg inte har en länk.
  isRead: boolean;
  createdAt: Timestamp | any;
  actionType?: string;
  suggestedNextStep?: string;
}

// Den gamla union-typen är nu borttagen. ActionableEvent är den enda källan till sanning.
export type Event = ActionableEvent;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachment?: {
    name: string;
    url: string;
  }; 
  timestamp: Timestamp | any;
}
