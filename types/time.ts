
// Fil: app/types/time.ts

/**
 * Definierar strukturen för en enskild tidrapport.
 * Varje rapport är kopplad till en användare och ett specifikt projekt.
 */
export interface TimeEntry {
  id: string;          // Unikt ID för tidrapporten
  userId: string;      // ID för användaren som rapporterar
  projectId: string;   // ID för projektet som tiden gäller
  date: Date;          // Datum för det utförda arbetet
  hours: number;       // Antal arbetade timmar
  description: string; // En kort beskrivning av vad som gjordes
  createdAt: Date;     // Tidsstämpel när rapporten skapades
}
