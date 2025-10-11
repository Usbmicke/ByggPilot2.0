
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// =================================================================================
// GULDSTANDARD - NEXT-AUTH TYP-UTÖKNING V2.0
// REVIDERING:
// 1. KONSOLIDERING AV SESSION-STATUS: Denna fil blir den enda källan till sanning
//    för `session.user`-objektets form.
// 2. EXPLICITA FÄLT: Lägger till `onboardingComplete` och `tourCompleted` för att
//    direkt spegla datan som hämtas från Firestore i `session`-callbacken.
// 3. HÄRLEDD `isNewUser`: `isNewUser` definieras som en obligatorisk boolean som härleds
//    i realtid (`!onboardingComplete`), vilket garanterar att den alltid är synkad.
// 4. BORTTAGNING AV REDUNDANS: Det gamla `isNewUser: boolean | null;` tas bort för att
//    eliminera all tvetydighet.
// =================================================================================

declare module "next-auth" {
    /**
     * Utökar standard-sessionen för att inkludera våra anpassade fält.
     */
    interface Session {
        user: {
            id: string;
            onboardingComplete: boolean;
            tourCompleted: boolean;
            isNewUser: boolean; // Härleds alltid, aldrig null
        } & DefaultSession["user"];
    }

    /**
     * Utökar standard-användaren för att matcha de nya fälten.
     */
    interface User extends DefaultUser {
        onboardingComplete: boolean;
        tourCompleted: boolean;
    }
}

declare module "next-auth/jwt" {
    /**
     * Utökar JWT för att inkludera användarens ID.
     */
    interface JWT {
        id: string;
    }
}
