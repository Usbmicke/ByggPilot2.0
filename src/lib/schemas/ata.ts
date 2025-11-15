/**
 * Definerar datastrukturen och status-typer för ett ÄTA-arbete.
 */

// Enum för att representera de olika stadierna ett ÄTA-arbete kan vara i.
export enum AtaStatus {
    Väntar = 'Väntar',
    Godkänd = 'Godkänd',
    Avvisad = 'Avvisad',
    Fakturerad = 'Fakturerad',
    Internt = 'Internt',
}

// Interface som definierar strukturen för ett ÄTA-objekt.
export interface Ata {
    id: string;                 // Unikt ID för ÄTA-arbetet
    title: string | null;       // Titel eller kort beskrivning
    description: string | null; // Mer detaljerad beskrivning av arbetet
    status: AtaStatus;          // Nuvarande status, hämtad från AtaStatus enum
    // Fler fält kan läggas till här vid behov (t.ex. kostnad, material, timmar)
}
