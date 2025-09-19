
// Fil: app/types/material.ts

/**
 * Definierar strukturen för en enskild materialkostnad.
 * Varje post är kopplad till ett specifikt projekt.
 */
export interface MaterialCost {
  id: string;          // Unikt ID för kostnaden
  projectId: string;   // ID för projektet kostnaden tillhör
  date: Date;          // Inköpsdatum
  description: string; // Vad som köptes
  amount: number;      // Kostnad i kronor (exkl. moms)
  supplier: string;    // Leverantör (valfritt)
  createdAt: Date;     // Tidsstämpel när posten skapades
}
