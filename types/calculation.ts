export type CalculationCategory = 'Material' | 'Arbete' | 'Underentreprenör' | 'Övrigt';

/**
 * Representerar en enskild rad i en kalkyl.
 */
export interface CalculationItem {
    id: string; // Unikt ID för raden, genereras vid skapande
    description: string; // Beskrivning, t.ex. "Ytterpanel 22x145 Furu"
    quantity: number; // Antal
    unit: string; // Enhet, t.ex. "st", "m", "kvm", "tim"
    unitPrice: number; // Pris per enhet (självkostnad)
    category: CalculationCategory; // Typ av kostnad
}

/**
 * Representerar hela kalkylen för ett projekt.
 * Detta objekt kommer att lagras i databasen.
 */
export interface Calculation {
    items: CalculationItem[];
    profitMarginPercentage: number; // Vinstpåslag i procent, t.ex. 15 för 15%
}
