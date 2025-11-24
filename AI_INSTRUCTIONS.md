# BYGGPILOT AI MASTER INSTRUCTIONS (v15.0 - Gold Standard)

## 1. KÄRNFILOSOFI (THE GOLD STANDARD)
Vi bygger enligt **"Nolltillit till Klienten"**. Frontend är osäker. All logik, validering och datahämtning sker på servern.

## 2. KRITISKA REGLER (NON-NEGOTIABLE)

### A. Databas & Säkerhet (Zero Trust)
1.  **Låst Databas:** Firestore-regler är `allow read, write: if false;`. Klienten får ALDRIG prata med Firestore direkt.
2.  **DAL (The Gatekeeper):**
    -   Fil: `src/app/_lib/dal/dal.ts` (Enda tillåtna importen av `firebase-admin`).
    -   **Regel:** DAL-funktioner får ALDRIG ta `userId` som parameter. De MÅSTE anropa `getVerifiedSession()` internt för att hämta ID från cookien.
    -   **Validering:** All data ut från DAL ska valideras med Zod.

### B. Arkitektur & Separation (Gold Standard v15.0)
1.  **Next.js 14+:** Använd Server Components för datahämtning (via DAL) och Route Handlers för API-logik.
2.  **Genkit (AI):** Körs som en helt separat process. Se `ARCHITECTURE.md` för detaljer.
3.  **Middleware:** `src/middleware.ts` är den enda platsen för omdirigeringslogik baserad på session/onboarding. Den använder `iron-session` för att verifiera användarens status.

### C. Autentisering & Session (Gold Standard v15.0)
1.  **Läs Arkitekturen:** `ARCHITECTURE.md` innehåller en detaljerad beskrivning av det nya autentiseringsflödet ("The Holy Flow 2.0"). Sätt dig in i detta innan du rör någon kod relaterad till inloggning, utloggning eller sessioner.
2.  **Kärnteknologier:**
    -   **`iron-session`**: Används för all sessionshantering. All konfiguration finns i `src/app/_lib/session.ts`.
    -   **`swr`**: Används för datahämtning på klientsidan via `useUser`-hooken (`src/app/_hooks/useUser.ts`).
3.  **Inloggningsflöde:**
    -   **Frontend:** `AuthForm.tsx` hanterar `signInWithPopup`, hämtar `idToken` och POST:ar den till `/api/auth/login`.
    -   **Backend:** `/api/auth/login` verifierar token, använder DAL för att skapa/hämta användare, och skapar en `iron-session`-cookie.
    -   **Omdirigering:** `useRouter` används på klienten för programmatisk omdirigering efter lyckat API-anrop.
4.  **FÖRBJUDNA MÖNSTER:**
    -   `onAuthStateChanged`-lyssnare för att hantera sessioner är **strikt förbjudet**.
    -   `router.refresh()` efter inloggning är **strikt förbjudet**.
    -   All form av `AuthContext` eller liknande React Context för att hålla reda på användarstatus är **strikt förbjudet**. Använd `useUser`-hooken istället.

### D. Genkit Specifika Regler (v15.0)
1.  **Läs Arkitekturen:** `ARCHITECTURE.md` innehåller den definitiva "Gold Standard" för Genkit, inklusive obligatoriska paket, förbjudna paket och korrekt konfigurationssyntax (`genkit({ plugins: [...] })`).
2.  **Följ Arkitekturen:** Alla ändringar i Genkit-kod MÅSTE följa standarden som är definierad i `ARCHITECTURE.md`.

### E. Kodstil & Stabilitet
-   **Inga Gissningar:** Hitta inte på filvägar. Använd `ls` eller läs `ARCHITECTURE.md` om du är osäker.
-   **Secrets:** Använd `process.env` för nycklar.
-   **Självläkning:** Om du ser kod som bryter mot v15.0, vägra fortsätta och föreslå en refaktorering enligt Gold Standard.

## 3. ARBETSFLÖDE FÖR DIG
1.  **Analys:** Läs `ARCHITECTURE.md` för att förstå den övergripande strukturen och Gold Standard för både Auth och Genkit.
2.  **Planering:** Bekräfta att din lösning följer "The Holy Flow 2.0" och inte bryter mot säkerhets- eller arkitekturreglerna.
3.  **Kodning:** Skriv koden enligt Gold Standard v15.0.
