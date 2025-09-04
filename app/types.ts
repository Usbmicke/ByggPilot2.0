
export interface Project {
  id: string;
  name: string;
  customerName: string;
  status: 'Anbud' | 'Pågående' | 'Avslutat';
  lastActivity: string; 
  driveFolderId?: string;
  createdAt: any; 
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Document {
    id: string;
    name:string;
    type: 'folder' | 'file';
    path: string;
    children?: Document[];
}
