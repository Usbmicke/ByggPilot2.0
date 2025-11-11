
// ===================================================================================================
// SCHEMA FÖR ÄNDRINGS- OCH TILLÄGGSARBETEN (ÄTA)
// ===================================================================================================
// Denna fil skapades efter att byggprocessen avslöjade att den inte existerade.
// Den definierar datastrukturerna för ÄTA-poster.
// ===================================================================================================

/**
 * Definierar de möjliga statusarna för en ÄTA.
 */
export enum AtaStatus {
  Väntar = 'Väntar',          // Väntar på kundens godkännande
  Godkänd = 'Godkänd',        // Godkänd av kunden
  Avvisad = 'Avvisad',        // Avvisad av kunden
  Fakturerad = 'Fakturerad',  // ÄTA:n har lagts till på en faktura
  Internt = 'Internt',        // Internt arbete, ej för kundfakturering
}

/**
 * Representerar en post för Ändrings- och Tilläggsarbete (ÄTA).
 */
export interface Ata {
  id: string;                // Unikt ID för ÄTA-posten
  title: string;             // Kort titel eller beskrivning
  description: string;       // Detaljerad beskrivning av arbetet
  status: AtaStatus;         // Nuvarande status för ÄTA:n
  amount: number;            // Kostnad för arbetet (exkl. moms)
  dateAdded: string;         // Datum då ÄTA:n skapades
  projectId: string;         // ID för det tillhörande projektet
}
