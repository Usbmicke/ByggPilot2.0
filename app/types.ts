
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
  id: string; // Firestore document ID
  name: string;
  email?: string;
  phone?: string;
  isCompany?: boolean;
}

export interface Project {
  id: string; // Firestore document ID
  name: string;
  customerId: string; // Koppling till Customer
  customerName?: string; // Cachelagrat kundnamn för enklare visning
  status: ProjectStatus; // Använder enumet för typsäkerhet
  progress?: number; // Framsteg i procent (0-100)
  driveFolderId?: string; // Koppling till Google Drive-mapp
  address?: string; // Adress för projektet
  lat?: number; // Geografisk latitud
  lon?: number; // Geografisk longitud
}
