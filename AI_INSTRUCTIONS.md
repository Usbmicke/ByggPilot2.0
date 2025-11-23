# BYGGPILOT AI MASTER INSTRUCTIONS (v15.0 - Gold Standard)

## 1. KÄRNFILOSOFI (THE GOLD STANDARD)
Vi bygger enligt **"Nolltillit till Klienten"**. Frontend är osäker. All logik, validering och datahämtning sker på servern.

## 2. KRITISKA REGLER (NON-NEGOTIABLE)

### A. Databas & Säkerhet (Zero Trust)
1. **Låst Databas:** Firestore-regler är `allow read, write: if false;`. Klienten får ALDRIG prata med Firestore direkt.
2. **DAL (The Gatekeeper):**
   - Fil: `src/app/_lib/dal/dal.ts` (Enda tillåtna importen av `firebase-admin`).
   - **Regel:** DAL-funktioner får ALDRIG ta `userId` som parameter. De MÅSTE anropa `verifySession()` internt för att hämta ID från cookien.
   - **Validering:** All data ut från DAL ska valideras med Zod.

### B. Arkitektur & Separation
1. **Next.js 16:** Använd Server Components för datahämtning (via DAL).
2. **Genkit (AI):** Körs som en helt separat process. Se `ARCHITECTURE.md` för detaljer.
3. **Middleware:** `src/middleware.ts` är enda platsen för omdirigeringslogik baserad på session/onboarding.

### C. Genkit Specifika Regler (v15.0)
1. **Läs Arkitekturen:** `ARCHITECTURE.md` innehåller den definitiva "Gold Standard" för Genkit, inklusive obligatoriska paket, förbjudna paket och korrekt konfigurationssyntax (`genkit({ plugins: [...] })`).
2. **Följ Arkitekturen:** Alla ändringar i Genkit-kod MÅSTE följa standarden som är definierad i `ARCHITECTURE.md`.

### D. Kodstil & Stabilitet
- **Inga Gissningar:** Hitta inte på filvägar. Använd `ls` eller läs `ARCHITECTURE.md` om du är osäker.
- **Secrets:** Använd `process.env` för nycklar.
- **Självläkning:** Om du ser kod som bryter mot v15.0, vägra fortsätta och föreslå en refaktorering.

## 3. ARBETSFLÖDE FÖR DIG
1. **Analys:** Läs `ARCHITECTURE.md` för att förstå den övergripande strukturen och Genkit Gold Standard.
2. **Planering:** Bekräfta att din lösning går via DAL och inte bryter mot säkerhets- eller arkitekturreglerna.
3. **Kodning:** Skriv koden enligt Gold Standard.
