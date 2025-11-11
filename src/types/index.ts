
import { type DefaultSession } from "next-auth";

/**
 * ByggPilots anpassade användaregenskaper.
 */
type ByggPilotUserFields = {
  id: string; 
  companyName?: string | null;
  onboardingComplete?: boolean | null;
  driveRootFolderId?: string | null;
  driveRootFolderUrl?: string | null;
};

declare module "next-auth" {
  /**
   * Anpassad Session-modell.
   * HÄR ÄR DEN KRITISKA ÄNDRINGEN: Vi utökar den globala `UserProfile` istället för `DefaultSession["user"]`.
   * Detta antar att UserProfile är en globalt definierad typ i ditt projekt.
   */
  interface Session extends DefaultSession {
    user: UserProfile & ByggPilotUserFields;
  }

  /**
   * Anpassad User-modell.
   */
  interface User extends ByggPilotUserFields {}
}

// --- DECOUPLED DATA MODELS --- //

export interface ActionableEvent {
  id: string;
  type: 'new_task' | 'invoice_due' | 'project_approved' | 'new_message' | 'log' | 'Tip';
  title: string;
  description?: string;
  message?: string;
  link?: string;
  isRead: boolean;
  createdAt: any; 
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
