
import { FieldValue } from 'firebase-admin/firestore';

// ===============================================
// GRUNDLÄGGANDE DATAMODELLER
// ===============================================

// Grundläggande användarinformation från NextAuth
export interface UserProfile {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

// ===============================================
// CHATT-RELATERADE TYPER (GULDSTANDARD)
// ===============================================

/**
 * Representerar en bilaga i ett chattmeddelande.
 * Innehållet är en Base64-kodad sträng.
 */
export interface FileAttachment {
    name: string;
    type: string;
    content: string; // Base64 encoded file
}

/**
 * Representerar ett enskilt meddelande i chattflödet.
 */
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    attachment?: FileAttachment; // Frivillig bilaga
}

// ===============================================
// PROJEKT-RELATERADE TYPER
// ===============================================

// Projektstatus
export enum ProjectStatus {
    Planning = 'Planering',
    InProgress = 'Pågående',
    OnHold = 'Pausat',
    Completed = 'Avslutat',
}

// Projekt-datatyp
export interface Project {
    id: string;
    name: string;
    customerName: string;
    description: string;
    status: ProjectStatus;
    ownerId: string;
    assignedUserIds: string[];
    createdAt: string; 
    lastActivity: string;
    progress?: number;
    riskAnalysisJson?: string | null;
    archivedAt: string | null; 
}

// Representerar ett dokument kopplat till ett projekt
export interface Document {
    id: string; 
    name: string;
    url: string; 
    type: string; 
    size: number; 
    uploadedAt: string;
}

// ===============================================
// MODAL- & VERKTYGS-RELATERADE TYPER
// ===============================================

/**
 * Information om ett företag, ofta hämtat från externa källor.
 */
export interface CompanyInfo {
    orgNr: string;
    name: string;
    address?: string; // Frivilligt, all data kanske inte alltid finns
    isVatRegistered?: boolean | 'Okänd'; // Om företaget är momsregistrerat
    hasFtax?: boolean | 'Okänd'; // Om företaget har F-skattsedel
}

/**
 * Representerar ett fakturaunderlag som kan skickas till ett bokföringssystem.
 */
export interface Invoice {
    id: string;
    projectId: string;
    // customer kan vara antingen en referens till ett företag eller bara ett namn
    customer: {
        type: 'Company' | 'PrivatePerson';
        orgNr?: string | null;
        name: string;
    };
    issueDate: string; // Fakturadatum
    dueDate: string;   // Förfallodatum
    invoiceLines: InvoiceLine[];
    rotDeduction?: RotDeduction; // Frivilligt fält för ROT-avdrag
    status: 'Utkast' | 'Skapad' | 'Skickad' | 'Betald';
}

/**
 * En rad på en faktura.
 */
export interface InvoiceLine {
    description: string;
    quantity: number;
    unit: 'tim' | 'st' | 'd' | 'm²' | 'km'; // Tydliga enheter
    unitPrice: number; // Pris per enhet (exkl. moms)
    vatRate: 25 | 12 | 6 | 0; // Moms-sats i procent
}

/**
 * Specifik information som krävs för ett ROT-avdrag.
 */
export interface RotDeduction {
    customerPersonalId: string;   // Kundens personnummer
    propertyId: string;           // Fastighetsbeteckning
    laborCost: number;            // Total arbetskostnad för ROT-arbetet
    requestedAmount: number;      // Det belopp som söks i avdrag
}

// Representerar en riskfaktor i kalkylen
export interface RiskFactor {
    name: string;
    probability: 'Låg' | 'Medel' | 'Hög';
    consequence: 'Låg' | 'Medel' | 'Hög';
    mitigation: string;
}

// Hela riskanalys-objektet
export interface RiskAnalysis {
    materialCost: number;
    laborCost: number;
    otherCosts: number;
    subcontractorCosts: number;
    riskFactors: RiskFactor[];
    profitMarginPercentage: number;
}
