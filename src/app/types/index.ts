
// ===================================================================================================
// ALLMÄNNA TYPDEFINITIONER FÖR PROJEKTET
// ===================================================================================================
// Denna fil samlar alla centrala datamodeller för applikationen.
// Filen skapades efter en lång och smärtsam felsökning där det visade sig att den inte existerade,
// vilket orsakade alla byggfel relaterade till modulimport.
// ===================================================================================================

/**
 * Representerar en kund i systemet.
 */
export interface Customer {
  id: string;          // Unikt ID för kunden
  name: string;        // Kundens namn
  email: string;       // Kundens e-postadress
}

/**
 * Representerar ett projekt.
 */
export interface Project {
  id: string;                    // Unikt ID för projektet
  projectName: string;           // Projektets namn
  customer: Customer;            // Kunden som är associerad med projektet
  status: 'Pågående' | 'Avslutat' | 'Väntar'; // Projektets status
}

/**
 * Representerar en faktura kopplad till ett projekt.
 */
export interface Invoice {
  invoiceId: string;   // Unikt ID för fakturan
  projectId: string;   // ID för det tillhörande projektet
  amount: number;      // Fakturabelopp
  status: 'Skickad' | 'Betald' | 'Förfallen'; // Fakturastatus
  dueDate: string;     // Förfallodatum
}

/**
 * Representerar ett steg i onboarding-processen.
 * Används inte aktivt längre men behålls för framtida referens.
 */
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: () => void;
}
