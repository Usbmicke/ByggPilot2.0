
import { Project, Customer, TimeEntry, Document } from '@/app/types';

// --- DYNAMISK DATUMBERÄKNING ---
const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

// --- PÅHITTADE KUNDER ---
export const demoCustomers: Customer[] = [
    {
        id: 'demo-cust-1',
        name: 'Kalle Anka Bygg & Entreprenad',
        email: 'kalle.anka@exempel.se',
        phone: '070-123 45 67',
        createdAt: daysAgo(30),
    },
    {
        id: 'demo-cust-2',
        name: 'Musse Pigg Fastigheter',
        email: 'musse.pigg@exempel.se',
        phone: '070-987 65 43',
        createdAt: daysAgo(60),
    },
];

// --- PÅHITTADE PROJEKT (FÖRBÄTTRADE MED RIKARE DATA) ---
export const demoProjects: Project[] = [
    {
        id: 'demo-proj-1',
        name: 'Villa Ankeborg Renovering',
        customerId: 'demo-cust-1',
        customerName: 'Kalle Anka Bygg & Entreprenad',
        status: 'Pågående',
        lastActivity: daysAgo(2),
        createdAt: daysAgo(25),
        progress: 65, // Ny egenskap
        address: 'Ankeborgsvägen 1, 123 45 ANKEBORG' // Ny egenskap
    },
    {
        id: 'demo-proj-4',
        name: 'Balkongbygge Kv. Fågel Fenix',
        customerId: 'demo-cust-2',
        customerName: 'Musse Pigg Fastigheter',
        status: 'Planerat',
        lastActivity: daysAgo(7),
        createdAt: daysAgo(15),
        progress: 10, // Ny egenskap
        address: 'Paradgatan 5A, 123 46 NYA STAN' // Ny egenskap
    },
    {
        id: 'demo-proj-2',
        name: 'Attefallshus i Nya Stan',
        customerId: 'demo-cust-2',
        customerName: 'Musse Pigg Fastigheter',
        status: 'Anbud',
        lastActivity: daysAgo(5),
        createdAt: daysAgo(5),
        progress: 0, // Ny egenskap
        address: 'Mussevägen 22, 123 46 NYA STAN' // Ny egenskap
    },
    {
        id: 'demo-proj-3',
        name: 'Takbyte Gamla Vägen 12',
        customerId: 'demo-cust-1',
        customerName: 'Kalle Anka Bygg & Entreprenad',
        status: 'Avslutat',
        lastActivity: daysAgo(30),
        createdAt: daysAgo(50),
        progress: 100, // Ny egenskap
        address: 'Gamla Vägen 12, 123 44 GAMLEBY' // Ny egenskap
    },
];

// --- PÅHITTADE TIDRAPPORTER ---
export const demoTimeEntries: TimeEntry[] = [
    {
        id: 'demo-time-1', userId: 'demo-user', projectId: 'demo-proj-1', projectName: 'Villa Ankeborg Renovering',
        customerName: 'Kalle Anka Bygg & Entreprenad', date: daysAgo(1).substring(0, 10), hours: 8,
        comment: 'Rivning av gammalt kök och förberedelse för VVS.', createdAt: daysAgo(1),
    },
    {
        id: 'demo-time-2', userId: 'demo-user', projectId: 'demo-proj-1', projectName: 'Villa Ankeborg Renovering',
        customerName: 'Kalle Anka Bygg & Entreprenad', date: daysAgo(2).substring(0, 10), hours: 6.5,
        comment: 'Montering av nya fönster i vardagsrum.', createdAt: daysAgo(2),
    },
];

// --- PÅHITTAD DOKUMENTSTRUKTUR ---
export const demoDocuments: Document[] = [
    { 
        id: 'doc-proj-1', name: 'Villa Ankeborg Renovering', type: 'folder', path: '/Villa Ankeborg Renovering',
        children: [
            { id: 'doc-offer-1', name: 'Offert_Villa_Ankeborg.pdf', type: 'file', path: '/Villa Ankeborg Renovering/Offert_Villa_Ankeborg.pdf' },
            { id: 'doc-blueprint-1', name: 'Ritningar_kök.pdf', type: 'file', path: '/Villa Ankeborg Renovering/Ritningar_kök.pdf' },
            { 
                id: 'doc-images-1', name: 'Bilder', type: 'folder', path: '/Villa Ankeborg Renovering/Bilder',
                children: [
                    { id: 'doc-img-1', name: 'före_rivning_1.jpg', type: 'file', path: '/Villa Ankeborg Renovering/Bilder/före_rivning_1.jpg' },
                    { id: 'doc-img-2', name: 'fönstermontering.jpg', type: 'file', path: '/Villa Ankeborg Renovering/Bilder/fönstermontering.jpg' },
                ]
            }
        ]
    },
    { 
        id: 'doc-proj-4', name: 'Balkongbygge Kv. Fågel Fenix', type: 'folder', path: '/Balkongbygge Kv. Fågel Fenix',
        children: [
            { id: 'doc-offer-4', name: 'Godkänd_Offert_Balkong.pdf', type: 'file', path: '/Balkongbygge Kv. Fågel Fenix/Godkänd_Offert_Balkong.pdf' },
        ]
    },
    { 
        id: 'doc-proj-2', name: 'Attefallshus i Nya Stan', type: 'folder', path: '/Attefallshus i Nya Stan',
        children: [
             { id: 'doc-offer-2', name: 'Anbud_Attefall.pdf', type: 'file', path: '/Attefallshus i Nya Stan/Anbud_Attefall.pdf' },
        ]
    },
    { 
        id: 'doc-proj-3', name: 'Takbyte Gamla Vägen 12', type: 'folder', path: '/Takbyte Gamla Vägen 12',
        children: [
            { id: 'doc-final-1', name: 'Slutbesiktning.pdf', type: 'file', path: '/Takbyte Gamla Vägen 12/Slutbesiktning.pdf' },
        ]
    },
    { id: 'doc-other-1', name: 'KMA-Pärm_2023.pdf', type: 'file', path: '/KMA-Pärm_2023.pdf' },

];
