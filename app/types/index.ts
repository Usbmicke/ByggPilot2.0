
// =====================================================================================
// CENTRALISERAD TYP-FIL FÖR HELA APPLIKATIONEN
// Världsklasskodning kräver typ-säkerhet. Denna fil är den enda källan för sanning.
// =====================================================================================

import { Timestamp } from 'firebase-admin/firestore';

// -----------------------------------------
// KÄRN-ENTITETER
// -----------------------------------------

/** Användarprofil i Firestore och NextAuth-session. */
export interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt?: Timestamp | any; // Helst Timestamp, any för flexibilitet
  isNewUser?: boolean;
  termsAccepted?: boolean;
  onboardingComplete?: boolean;
  companyId?: string | null;
  companyName?: string | null;
}

// Alias för konsekvens i komponenter
export type User = UserProfile;

/** Kund (Företag eller Privatperson). */
export interface Customer {
  id: string;
  customerType: 'Company' | 'PrivatePerson';
  email: string;
  phone?: string;
  companyName?: string;
  orgNumber?: string;
  referencePerson?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Timestamp | any;
}

/** Projektstatus - en kritisk del av projekt-livscykeln. */
export type ProjectStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Archived';

/** Huvudprojektet som binder samman allt. */
export interface Project {
  id: string;
  name: string;
  customerId: string;
  customerName?: string; // Denormaliserad för enkel visning
  status: ProjectStatus;
  startDate?: Timestamp | any;
  endDate?: Timestamp | any;
  description?: string;
  totalInvoiced?: number;
  totalCost?: number;
  createdAt: Timestamp | any;
}

/** En uppgift (Task) inom ett projekt. */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  deadline?: Timestamp | any;
}

/** Material som används i ett projekt. */
export interface Material {
  id: string;
  projectId: string;
  name: string;
  quantity: number;
  unit: string; // t.ex. 'st', 'm', 'kg'
  pricePerUnit: number;
  supplier?: string;
}

/** Tidrapportering för en uppgift. */
export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: Timestamp | any;
  endTime: Timestamp | any;
  description?: string;
}

/** Fil kopplad till ett projekt (t.ex. ritning, avtal). */
export interface File {
  id: string;
  projectId: string;
  name: string;
  url: string;
  uploadedAt: Timestamp | any;
}

/** Ändrings- och Tilläggsarbete (ÄTA). */
export interface Ata {
  id: string;
  projectId: string;
  title: string;
  description: string;
  cost: number;
  isApproved: boolean;
  createdAt: Timestamp | any;
}


// -----------------------------------------
// FAKTURERING & EKONOMI
// -----------------------------------------

/** ROT-avdrag information. */
export interface RotDeduction {
  isApplicable: boolean;
  amount: number;
  personNumber?: string;
}

/** En rad på en faktura. */
export interface InvoiceLine {
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

/** Fakturan som skickas till kund. */
export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  lines: InvoiceLine[];
  rotDeduction: RotDeduction;
  totalAmount: number;
  dueDate: Timestamp | any;
  createdAt: Timestamp | any;
}

/** Data som behövs för att skapa en ny faktura. */
export type InvoiceCreationData = Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'createdAt'>;

/** Beräkning eller kalkyl för ett projekt. */
export interface Calculation {
  id: string;
  projectId: string;
  totalMaterialCost: number;
  totalLaborCost: number;
  otherCosts: number;
  totalEstimatedCost: number;
}


// -----------------------------------------
// INTERAKTION & GRÄNSSNITT
// -----------------------------------------

/** Händelser i systemet, ofta sådant som kräver en åtgärd. */
export interface ActionableEvent {
  id: string;
  type: 'new_task' | 'invoice_due' | 'project_approved' | 'new_message';
  title: string;
  description: string;
  link: string; // Länk till relevant sida
  isRead: boolean;
  createdAt: Timestamp | any;
}

// Generell händelse, kan vara en ActionableEvent eller bara en logg.
export type Event = ActionableEvent | { id: string; type: 'log'; message: string };

/** Ett meddelande i chatten. */
export interface ChatMessage {
  id: string;
  senderId: string; // 'user' eller 'system'/'ai'
  text: string;
  timestamp: Timestamp | any;
}
