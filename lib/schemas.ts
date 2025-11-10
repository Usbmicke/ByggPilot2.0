
// =================================================================================
// ZOD SCHEMAS (DATA-KONTRAKT)
// =================================================================================
// Denna fil definierar de Zod-scheman som agerar som våra "datakontrakt".
// De säkerställer stark typning och validering för all data som flödar
// genom systemet, från klienten till databasen och tillbaka.
// =================================================================================

import { z } from 'zod';

/**
 * Grundläggande schema för en användare i Firestore.
 * Innehåller all permanent information om användaren.
 */
export const UserSchema = z.object({
  userId: z.string().describe("Användarens unika Firebase Auth UID."),
  email: z.string().email().optional().describe("Användarens e-postadress."),
  onboardingComplete: z.boolean().describe("Flagga som visar om användaren slutfört onboarding."),
  createdAt: z.any().describe("Tidsstämpel för när användaren skapades."),

  // Företagsinformation (från onboarding)
  company: z.object({
    name: z.string().describe("Företagets namn."),
    orgNumber: z.string().optional().describe("Företagets organisationsnummer."),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        zip: z.string().optional(),
    }).optional().describe("Företagets adress."),
    logoUrl: z.string().url().optional().describe("URL till företagets logotyp i Firebase Storage."),
  }).optional(),

  // Standardinställningar (från onboarding)
  settings: z.object({
      defaultHourlyRate: z.number().optional().describe("Standard timpris för kalkyler."),
      defaultMaterialMarkup: z.number().optional().describe("Standard materialpåslag i procent."),
  }).optional(),
});

/**
 * Schema för den data som tas emot från klienten under onboarding-processen.
 * Detta är input-schemat för `onboardingCompleteFlow`.
 */
export const OnboardingDataSchema = z.object({
    companyName: z.string(),
    orgNumber: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        zip: z.string().optional(),
    }).optional(),
    logoUrl: z.string().url().optional(), // Anta att klienten laddat upp filen & skickar URL:en
    defaultHourlyRate: z.number().optional(),
    defaultMaterialMarkup: z.number().optional(),
});

/**
 * Schema för ett Projekt.
 */
export const ProjectSchema = z.object({
    projectId: z.string(),
    userId: z.string().describe("UID för ägaren av projektet."),
    name: z.string(),
    createdAt: z.any(),
    // ... andra projektfält kommer att läggas till här
});

// Exporterar typerna för enkel användning i koden.
export type User = z.infer<typeof UserSchema>;
export type OnboardingData = z.infer<typeof OnboardingDataSchema>;
export type Project = z.infer<typeof ProjectSchema>;
