
// --- DECOUPLED DATA MODELS --- //

export interface ActionableEvent {
  id: string;
  type: 'new_task' | 'invoice_due' | 'project_approved' | 'new_message' | 'log' | 'Tip';
  title: string;
  description?: string;
  message?: string;
  link?: string;
  isRead: boolean;
  // Korrigerad från 'any' till 'string' för ökad typsäkerhet.
  // Tidsstämplar från servern serialiseras oftast till ISO-strängar.
  createdAt: string; 
}

export interface Project {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
}

export interface InvoiceLine {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface RotDeduction {
  isApplicable: boolean;
  personNumber?: string;
  laborCost: number;
  amount: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  customerId: string;
  lines: InvoiceLine[];
  rotDeduction?: RotDeduction;
}

export interface InvoiceCreationData {
  projectId: string;
  customer: Customer;
  invoiceLines: InvoiceLine[];
  issueDate: Date;
  dueDate: Date;
  rotDeduction: RotDeduction;
}
