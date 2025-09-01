
import { Project, Customer, Contact, Document, ProjectStatus } from '../types';

const customers: Customer[] = [
    { id: 'c1', name: 'Familjen Nilsson', contactPerson: 'Lars Nilsson', email: 'lars.nilsson@privat.se', phone: '070-123 45 67' },
    { id: 'c2', name: 'BRF Utsikten', contactPerson: 'Anna Lind', email: 'anna.lind@brfutsikten.se', phone: '072-234 56 78' },
    { id: 'c3', name: 'Erik Johansson', contactPerson: 'Erik Johansson', email: 'erik.j@gmail.com', phone: '073-345 67 89' },
    { id: 'c4', name: 'Lena Berggren', contactPerson: 'Lena Berggren', email: 'lena.b@work.se', phone: '076-456 78 90' },
];

const contacts: Contact[] = [
    { id: 'ct1', name: 'Elfirman AB', role: 'Elektriker', email: 'kontakt@elfirman.se', phone: '08-111 22 33' },
    { id: 'ct2', name: 'Rörmokarn i Stan', role: 'VVS', email: 'info@rormokarnistan.se', phone: '08-444 55 66' },
    { id: 'ct3', name: 'Måleri & Färg', role: 'Målare', email: 'order@maleri.se', phone: '08-777 88 99' },
    { id: 'ct4', name: 'Arkitektbyrån Vision', role: 'Arkitekt', email: 'kontakt@visionark.se', phone: '08-999 88 77'},
];

const projects: Project[] = [
  { 
    id: 'p1', 
    name: 'Villa Ekhagen', 
    customer: customers[0], 
    address: 'Ekvägen 12, 123 45 Storstad', 
    status: ProjectStatus.ONGOING, 
    progress: 75, 
    lat: 59.3293, 
    lon: 18.0686,
    entreprenadform: 'Generalentreprenad',
    ansvarig: 'Micke',
    contacts: [contacts[0], contacts[1], contacts[2]],
    documents: [
        { id: 'd1-1', name: 'Förfrågningsunderlag', type: 'document', lastModified: '2024-05-10' },
        { id: 'd1-2', name: 'Ritningar', type: 'folder', lastModified: '2024-05-11' },
        { id: 'd1-3', name: 'Bilder', type: 'folder', lastModified: '2024-06-20' },
        { id: 'd1-4', name: 'Offert från Elfirman AB', type: 'document', lastModified: '2024-05-15' },
    ]
  },
  { 
    id: 'p2', 
    name: 'BRF Utsikten Fasadrenovering', 
    customer: customers[1], 
    address: 'Bergsgatan 1, 123 45 Storstad', 
    status: ProjectStatus.ONGOING, 
    progress: 40, 
    lat: 59.3320, 
    lon: 18.0551,
    entreprenadform: 'Totalentreprenad',
    ansvarig: 'Micke',
    contacts: [contacts[3]],
    documents: [
        { id: 'd2-1', name: 'Avtal', type: 'document', lastModified: '2024-04-01' },
        { id: 'd2-2', name: 'KMA-Plan', type: 'document', lastModified: '2024-04-20' },
    ]
  },
  { 
    id: 'p3', 
    name: 'Attefallshus', 
    customer: customers[2], 
    address: 'Sjöstigen 8, 123 45 Storstad', 
    status: ProjectStatus.PLANNING, 
    progress: 10, 
    lat: 59.3345, 
    lon: 18.0632,
    entreprenadform: 'Delad entreprenad',
    ansvarig: 'Micke',
    contacts: [contacts[0]],
    documents: [
         { id: 'd3-1', name: 'Bygglovsansökan', type: 'document', lastModified: '2024-06-05' },
    ]
  },
  { 
    id: 'p4', 
    name: 'Takbyte Sommarstugan', 
    customer: customers[3], 
    address: 'Skogsvägen 22, 678 90 Småby', 
    status: ProjectStatus.COMPLETED, 
    progress: 100, 
    lat: 58.4108, 
    lon: 15.6214,
    entreprenadform: 'Generalentreprenad',
    ansvarig: 'Micke',
    contacts: [],
    documents: [
        { id: 'd4-1', name: 'Slutfaktura', type: 'spreadsheet', lastModified: '2024-05-30' },
        { id: 'd4-2', name: 'Besiktningsprotokoll', type: 'document', lastModified: '2024-05-28' },
    ]
  },
];

export const mockData = {
    projects,
    customers,
    contacts,
}
