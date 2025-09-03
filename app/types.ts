export interface User {
  name: string;
  email: string;
  avatarUrl: string;
}

export enum ProjectStatus {
  PLANNING = 'Planering',
  ONGOING = 'Pågående',
  COMPLETED = 'Slutfört',
  INVOICED = 'Fakturerat',
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'document' | 'spreadsheet' | 'image';
  link?: string;
  lastModified: string;
}

export interface Customer {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
}

export interface Project {
  id: string;
  name: string;
  customer: Customer;
  address: string;
  status: ProjectStatus;
  progress: number; // 0-100
  lat: number;
  lon: number;
  entreprenadform: 'Generalentreprenad' | 'Totalentreprenad' | 'Delad entreprenad';
  ansvarig: string;
  contacts: Contact[];
  documents: Document[];
}


export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  isStreaming?: boolean;
}

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Notification {
  id: number;
  text: string;
  read: boolean;
}
