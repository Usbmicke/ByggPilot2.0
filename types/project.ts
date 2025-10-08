export type ProjectStatus = 'Offert' | 'Pågående' | 'Avslutat' | 'Fakturerat' | 'Arkiverat' | 'Positiv' | 'Varning';

export interface Project {
  id: string;
  userId: string;
  projectNumber: number;
  projectName: string;
  clientName: string;
  status: ProjectStatus;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  hourlyRate: number;
  totalHours?: number; // Calculated field, might not be in Firestore
  totalCost?: number;  // Calculated field, might not be in Firestore
}
