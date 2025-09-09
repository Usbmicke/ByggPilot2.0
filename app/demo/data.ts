
import { Project, Customer, TimeEntry, Document } from '@/app/types';

// Påhittade kunder
export const demoCustomers: Customer[] = [
    {
        id: 'demo-cust-1',
        name: 'Kalle Anka Bygg & Entreprenad',
        email: 'kalle.anka@exempel.se',
        phone: '070-123 45 67',
        createdAt: '2023-10-26T10:00:00Z',
    },
    {
        id: 'demo-cust-2',
        name: 'Musse Pigg Fastigheter',
        email: 'musse.pigg@exempel.se',
        phone: '070-987 65 43',
        createdAt: '2023-09-15T14:30:00Z',
    },
];

// Påhittade projekt - nu med korrekta datumsträngar
export const demoProjects: Project[] = [
    {
        id: 'demo-proj-1',
        name: 'Villa Ankeborg Renovering',
        customerId: 'demo-cust-1',
        customerName: 'Kalle Anka Bygg & Entreprenad',
        status: 'Pågående',
        lastActivity: '2023-10-26T14:00:00Z', // KORRIGERAT
        createdAt: '2023-10-26T10:05:00Z',
    },
    {
        id: 'demo-proj-2',
        name: 'Attefallshus i Nya Stan',
        customerId: 'demo-cust-2',
        customerName: 'Musse Pigg Fastigheter',
        status: 'Anbud',
        lastActivity: '2023-10-23T18:00:00Z', // KORRIGERAT
        createdAt: '2023-10-23T11:00:00Z',
    },
    {
        id: 'demo-proj-3',
        name: 'Takbyte Gamla Vägen 12',
        customerId: 'demo-cust-1',
        customerName: 'Kalle Anka Bygg & Entreprenad',
        status: 'Avslutat',
        lastActivity: '2023-09-28T12:00:00Z', // KORRIGERAT
        createdAt: '2023-08-20T09:00:00Z',
    },
];

// Påhittade tidrapporter
export const demoTimeEntries: TimeEntry[] = [
    {
        id: 'demo-time-1',
        userId: 'demo-user',
        projectId: 'demo-proj-1',
        projectName: 'Villa Ankeborg Renovering',
        customerName: 'Kalle Anka Bygg & Entreprenad',
        date: '2023-10-27',
        hours: 8,
        comment: 'Rivning av gammalt kök.',
        createdAt: '2023-10-27T17:00:00Z',
    },
    {
        id: 'demo-time-2',
        userId: 'demo-user',
        projectId: 'demo-proj-1',
        projectName: 'Villa Ankeborg Renovering',
        customerName: 'Kalle Anka Bygg & Entreprenad',
        date: '2023-10-26',
        hours: 6.5,
        comment: 'Montering av nya fönster.',
        createdAt: '2023-10-26T16:30:00Z',
    },
];

// Påhittad dokumentstruktur
export const demoDocuments: Document[] = [
    {
        id: 'doc-proj-1',
        name: 'Villa Ankeborg Renovering',
        type: 'folder',
        path: '/Villa Ankeborg Renovering',
        children: [
            { id: 'doc-offer-1', name: 'Offert_Villa_Ankeborg.pdf', type: 'file', path: '/Villa Ankeborg Renovering/Offert_Villa_Ankeborg.pdf' },
            { id: 'doc-blueprint-1', name: 'Ritningar_kök.pdf', type: 'file', path: '/Villa Ankeborg Renovering/Ritningar_kök.pdf' },
            {
                id: 'doc-images-1',
                name: 'Bilder',
                type: 'folder',
                path: '/Villa Ankeborg Renovering/Bilder',
                children: [
                    { id: 'doc-img-1', name: 'före_rivning_1.jpg', type: 'file', path: '/Villa Ankeborg Renovering/Bilder/före_rivning_1.jpg' },
                    { id: 'doc-img-2', name: 'fönstermontering.jpg', type: 'file', path: '/Villa Ankeborg Renovering/Bilder/fönstermontering.jpg' },
                ]
            }
        ]
    },
    {
        id: 'doc-proj-2',
        name: 'Attefallshus i Nya Stan',
        type: 'folder',
        path: '/Attefallshus i Nya Stan',
        children: [
             { id: 'doc-offer-2', name: 'Anbud_Attefall.pdf', type: 'file', path: '/Attefallshus i Nya Stan/Anbud_Attefall.pdf' },
        ]
    },
    {
        id: 'doc-proj-3',
        name: 'Takbyte Gamla Vägen 12',
        type: 'folder',
        path: '/Takbyte Gamla Vägen 12',
        children: [
            { id: 'doc-final-1', name: 'Slutbesiktning.pdf', type: 'file', path: '/Takbyte Gamla Vägen 12/Slutbesiktning.pdf' },
        ]
    },
    { id: 'doc-other-1', name: 'KMA-Pärm_2023.pdf', type: 'file', path: '/KMA-Pärm_2023.pdf' },

];
