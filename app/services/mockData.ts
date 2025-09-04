import { Project, TodoItem, Notification, ProjectStatus, Customer, Contact, Document } from '@/app/types';

// --- Kunder ---
const customerPersson: Customer = {
    id: 'cust_01',
    name: 'Familjen Persson',
    contactPerson: 'Lars Persson',
    email: 'lars.persson@example.com',
    phone: '070-123 45 67'
};

const customerBrf: Customer = {
    id: 'cust_02',
    name: 'BRF Utsikten',
    contactPerson: 'Anna Andersson',
    email: 'anna.andersson@brfutsikten.se',
    phone: '070-987 65 43'
};

const customerNilsson: Customer = {
    id: 'cust_03',
    name: 'Karin Nilsson',
    contactPerson: 'Karin Nilsson',
    email: 'karin.nilsson@gmail.com',
    phone: '070-555 12 12'
};

export const mockCustomers: Customer[] = [customerPersson, customerBrf, customerNilsson];

// --- Kontakter ---
const contactsVillaPersson: Contact[] = [
    { id: 'con_01', name: 'Elfirman AB', role: 'Elektriker', email: 'kontakt@elfirman.se', phone: '08-111 222' },
    { id: 'con_02', name: 'Rörmokarn', role: 'VVS', email: 'info@rormokarn.nu', phone: '08-333 444' },
];

const contactsBrf: Contact[] = [
    { id: 'con_03', name: 'Stål & Betong AB', role: 'Konstruktör', email: 'info@stalochbetong.se', phone: '08-555 666' },
];

// --- Dokument ---
const documentsVillaPersson: Document[] = [
    { id: 'doc_01', name: '01_Kunder & Anbud', type: 'folder', lastModified: '2023-10-10' },
    { id: 'doc_02', name: 'Ritning A-12.pdf', type: 'file', lastModified: '2023-10-12' },
    { id: 'doc_03', name: 'Offert_Villa_Persson.pdf', type: 'file', lastModified: '2023-09-28' },
];

const documentsBrf: Document[] = [
     { id: 'doc_04', name: '02_Pågående Projekt', type: 'folder', lastModified: '2023-11-01' },
];

// --- Projekt ---
export const mockProjects: Project[] = [
  {
    id: 'proj_01',
    name: 'Villa Persson - Tillbyggnad',
    customer: customerPersson,
    address: 'Parkvägen 12, 123 45, Stockholm',
    status: ProjectStatus.ONGOING,
    progress: 75,
    lat: 59.3293,
    lon: 18.0686,
    entreprenadform: 'Generalentreprenad',
    ansvarig: 'Micke',
    contacts: contactsVillaPersson,
    documents: documentsVillaPersson,
  },
  {
    id: 'proj_02',
    name: 'BRF Utsikten - Balkongrenovering',
    customer: customerBrf,
    address: 'Sjögatan 8, 111 22, Stockholm',
    status: ProjectStatus.PLANNING,
    progress: 15,
    lat: 59.3323,
    lon: 18.0746,
    entreprenadform: 'Totalentreprenad',
    ansvarig: 'Micke',
    contacts: contactsBrf,
    documents: documentsBrf,
  },
  {
    id: 'proj_03',
    name: 'Köksrenovering hos Nilsson',
    customer: customerNilsson,
    address: 'Gamla Vägen 3, 543 21, Uppsala',
    status: ProjectStatus.COMPLETED,
    progress: 100,
    lat: 59.8586,
    lon: 17.6389,
    entreprenadform: 'Delad entreprenad',
    ansvarig: 'Micke',
    contacts: [],
    documents: [],
  },
];

// --- Att Göra-lista ---
export const mockTodos: TodoItem[] = [
    { id: 'todo_01', text: 'Beställa fönster till Villa Persson', completed: false },
    { id: 'todo_02', text: 'Skicka in KMA-pärm för BRF Utsikten', completed: false },
    { id: 'todo_03', text: 'Fakturera Nilsson för köksrenovering', completed: true },
    { id: 'todo_04', text: 'Boka uppstartsmöte med Elfirman AB', completed: false },
];

// --- Notifikationer ---
export const mockNotifications: Notification[] = [
    { id: 1, text: 'Nytt ÄTA-arbete tillagt för Villa Persson', read: false },
    { id: 2, text: 'Ritning A-13 har laddats upp för BRF Utsikten', read: false },
    { id: 3, text: 'Påminnelse: Projektbesiktning för Nilsson imorgon kl 10:00', read: true },
];
