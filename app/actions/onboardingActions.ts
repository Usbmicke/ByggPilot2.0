
"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/admin";
import { z } from "zod";
import { createInitialFolderStructure } from "@/services/driveService"; // Kommer att skapas

// =================================================================================
// ONBOARDING ACTIONS V1.0 - GULDSTANDARD
// ARKITEKTUR: Följer "Single Action" -principen. En enda, robust Server Action
// hanterar hela onboarding-flödet, uppdelat med ett internt `step`-argument.
// Detta centraliserar logik och förenklar både frontend och backend.
// =sever
// SÄKERHET: Varje steg valideras med ett dedikerat Zod-schema.
// Användarsessionen verifieras vid varje anrop.
// =================================================================================

// --- Zod Schemas for Validation (Nollförtroende-principen) ---

const companyProfileSchema = z.object({
  companyName: z.string().min(2, "Företagsnamn måste vara minst 2 tecken."),
  orgNumber: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url("Måste vara en giltig URL.").optional(),
});

const recipeBookSchema = z.object({
  defaultHourlyRate: z.coerce.number().positive("Timpris måste vara ett positivt tal."),
  defaultMaterialMarkup: z.coerce.number().min(0, "Materialpåslag kan inte vara negativt."),
});

/**
 * Hanterar hela onboarding-flödet steg för steg.
 * @param step Det steg i processen som ska exekveras.
 * @param data Den data som är associerad med steget.
 */
export async function completeOnboarding(step: number, data: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.accessToken) {
    return { success: false, error: "Åtkomst nekad: Ogiltig session." };
  }

  const userId = session.user.id;

  try {
    switch (step) {
      // STEG 1: Företagsprofil
      case 1:
        const validatedProfile = companyProfileSchema.safeParse(data);
        if (!validatedProfile.success) {
          return { success: false, error: "Ogiltig data.", details: validatedProfile.error.flatten() };
        }
        await adminDb.collection("users").doc(userId).update({
          companyProfile: validatedProfile.data,
          onboardingStep: 1,
        });
        return { success: true, data: validatedProfile.data };

      // STEG 2: Skapa Mappstruktur
      case 2:
        const userDoc = await adminDb.collection("users").doc(userId).get();
        const companyName = userDoc.data()?.companyProfile?.companyName;
        if (!companyName) {
           throw new Error("Företagsnamn saknas för att kunna skapa mappstruktur.");
        }
        
        const rootFolderId = await createInitialFolderStructure(session.accessToken, companyName);
        await adminDb.collection("users").doc(userId).update({
          driveRootFolderId: rootFolderId,
          onboardingStep: 2,
        });
        return { success: true, data: { rootFolderId } };

      // STEG 3: Receptbok/Priser
      case 3:
        const validatedRates = recipeBookSchema.safeParse(data);
        if (!validatedRates.success) {
          return { success: false, error: "Ogiltig data.", details: validatedRates.error.flatten() };
        }
        await adminDb.collection("users").doc(userId).update({
          recipeBook: validatedRates.data,
          onboardingStep: 3,
        });
        return { success: true, data: validatedRates.data };

      // STEG 4: Slutförande
      case 4:
        await adminDb.collection("users").doc(userId).update({
          onboardingComplete: true,
          onboardingStep: 4,
        });
        // Här skulle logik för att skapa demoprojekt/starta guidad tur ligga.
        return { success: true };

      default:
        return { success: false, error: "Ogiltigt steg." };
    }
  } catch (e) {
    const error = e as Error;
    console.error({
      message: `Onboarding-fel vid steg ${step}`,
      userId: userId,
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: "Ett oväntat serverfel inträffade. Vänligen försök igen." };
  }
}
