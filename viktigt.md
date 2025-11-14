# ByggPilot Master-Dokument & Arkitektur (v5.0 - Genkit Gemini 2.5)

**Status:** Aktiv
**Senast Uppdaterad:** 2025-11-12
**Ägare:** Michael Ekengren Fogelström
**Paradigm:** Den Dunderstabila Genkit-Hybriden (med Modell-dirigering)

---

## 1. Vision & Kärnprinciper ("ByggPilot-Tänket")

Detta dokument är den **enda källan till sanning** för projektets arkitektur och tekniska strategi.

### 1.1. Filosofi
ByggPilot är en **proaktiv digital kollega** för hantverkare. Målet är att eliminera administrativt krångel och maximera lönsamheten.

### 1.2. Icke-förhandlingsbara Principer
1.  **Säkerhet Genom Design:** All backend-logik skyddas av Firebase Autentisering via Genkit-triggers (`onFlow`).
2.  **Stabilitet & Kontroll:** AI:n agerar aldrig fritt. Allt styrs via "Tool Use". AI:ns output tvingas till förutsägbara format via Zod-scheman.
3.  **Ren Kod & Tydliga Gränssnitt:** Strikt separation mellan frontend (Next.js för UI) och backend (Genkit för **all** logik).

---

## 2. Arkitektur-Blueprint

### 2.1. Systemöversikt

*   **Frontend (UI-lagret):**
    *   **Ramverk:** Next.js
    *   **Ansvar:** Rendera UI, hantera klient-sidig state, och anropa backend. `useChat` från Vercel AI SDK används för chatt-gränssnittet.

*   **Backend (Logik- & Datalagret):**
    *   **Ramverk:** Firebase Genkit
    *   **Ansvar:** **All affärslogik,** databas-interaktioner (via `dal.ts`), och AI-orkestrering.

### 2.2. Modell-Strategi (Hjärnans Arkitektur)

ByggPilots AI är ett system av specialiserade modeller som dirigeras av Genkit för maximal prestanda och kostnadseffektivitet.

*   **"Arbetsmyran" (Låg kostnad, hög hastighet): `gemini-1.5-flash`**
    *   **Syfte:** Standardmodell för majoriteten av alla chattkonversationer, avsikts-tolkning och enklare uppgifter. Blixtsnabb och billig i drift.

*   **"Experten" (Hög kapacitet, djupt resonemang): `gemini-1.5-pro`**
    *   **Syfte:** Används av Genkit för uppgifter som kräver hög precision och komplext resonemang.
    *   **Användningsfall:**
        *   **Strukturerad Data:** Generering av offerter, riskanalyser, och arbetsberedningar där output måste följa komplexa Zod-scheman.
        *   **Komplext Resonemang:** Analys av data från "Företagets Hjärna" (RAG).
        *   **Kritiska Integrationer:** Generering av SIE4-filer eller juridiska dokument.

*   **"Örat" & "Ögat" (Multimodala Modeller): `gemini-1.5-pro` (med Vision/Audio-input)**
    *   **Syfte:** Hanterar specialiserade flöden som kräver ljud- eller bilduppladdning.
    *   **Användningsfall:**
        *   **`audioToAtaFlow`:** Transkriberar ljud, förstår avsikten och skapar ett ÄTA-underlag i ett enda anrop.
        *   **`analyzeImageForPpeFlow`:** Analyserar bild för att kontrollera användning av personlig skyddsutrustning.

### 2.3. Kärnflöden

*   **Autentisering (`getOrCreateUserAndCheckStatusFlow`):**
    *   Hanteras av en central `AuthProvider` i Next.js som anropar ett Genkit-flöde via `onFlow` vid inloggning för att synka användaren mot Firestore.

*   **Standard-chatt (`chatFlow`):**
    *   **Modell:** `gemini-1.5-flash`
    *   **Logik:** Hanterar den primära chatten. Flash-modellen är konfigurerad att kunna anropa relevanta verktyg (RAG-sökning, skapa projekt, etc.).

*   **Ljud-till-ÄTA (`audioToAtaFlow`):**
    *   **Modell:** `gemini-1.5-pro` (multimodal)
    *   **Logik:** Ett specialiserat flöde som endast har tillgång till verktyget `createChangeOrderTool` för att garantera korrekt output.

*   **Offert-generering (`generateQuoteFlow`):**
    *   **Modell:** `gemini-1.5-pro`
    *   **Logik:** Dedikerat flöde som använder RAG-verktyg för att grunda offerten i företagets data och sedan generera ett perfekt formaterat dokument.

---

## 3. Strategisk Roadmap & Checklista (v5.0)

### Fas 0-1: Grund & Sanering
- [X] `NextAuth.js` och all gammal API-logik är helt raderad.
- [X] Projektet har en ren struktur med `src/lib/genkit/` för backend och separata mappar för `dal` och `schemas`.
- [X] `dal.ts` och `schemas.ts` är etablerade som enda källor för datalager och validering.

### Fas 2: Kärnflöde (Auth)
- [X] Backend-flöde `getOrCreateUserAndCheckStatusFlow` är implementerat.
- [X] Frontend `AuthProvider` med `signInWithRedirect` är implementerat.
- [X] Onboarding-flödet är anslutet till Genkit.

### Fas 3-4: "Hjärnan" & Kärnfunktionalitet
- [X] `chatFlow` är implementerat i Genkit med `gemini-1.5-flash`.
- [X] Frontend `useChat` är anslutet till Genkit-slutpunkten.
- [X] Specialiserade flöden (`generateQuoteFlow`, `audioToAtaFlow`) är definierade med `gemini-1.5-pro`.
- **[PÅGÅR NU]** 4.1: Implementation av "Företagets Hjärna" (RAG) med Gemini File Search API.
- **[PÅGÅR NU]** 4.2: Implementation av resterande kärnverktyg som `Flows`.

### Fas 5: Verifiering & Härdning

#### **5.0: Akut Säkerhets- och Stabilitetsgranskning (Resultat 2025-11-12)**

*Denna sektion är ett resultat av en proaktiv granskning och listar kritiska brister som måste åtgärdas för att uppnå "världsklass"-standard.*

- **[KRITISK SÄKERHETSLUCKA] Behörighetskontroll saknas i flöden:**
    - **Beskrivning:** Flera flöden (`audioToAtaFlow`, `generateQuoteFlow`, etc.) tar emot ett `projectId` men verifierar **inte** att den inloggade användaren har behörighet att agera på det projektet.
    - **Risk:** En användare kan potentiellt skapa, ändra eller se data i andras projekt genom att gissa projekt-ID:n.
    - **Åtgärd:** Inför en obligatorisk behörighetskontroll i början av varje flöde som hanterar projektdata. Funktionen måste slå upp projektet och verifiera att `context.auth.uid` är ägare eller har tilldelats åtkomst.

- **[RISK FÖR DATAKORRUPTION] AI-genererad data sparas utan validering:**
    - **Beskrivning:** Flöden som `audioToAtaFlow` litar blint på att AI:n extraherar korrekt information och sparar den direkt i databasen.
    - **Risk:** AI-hallucinationer eller misstolkningar kan leda till att felaktig och kostsam data (fel pris, fel material) sparas permanent.
    - **Åtgärd:** Implementera ett "Human-in-the-Loop"-steg. Istället för att spara direkt, returnera den extraherade datan till klienten för granskning och godkännande av användaren innan den committas till databasen.

- **[RISK FÖR INKONSEKVENS] Icke-atomära operationer vid användarskapande:**
    - **Beskrivning:** "Get-or-create"-logiken i `getOrCreateUserAndCheckStatusFlow` är sårbar för race conditions om den anropas snabbt flera gånger.
    - **Risk:** Kan leda till dubbletter eller fel när en användarprofil ska skapas.
    - **Åtgärd:** Omslut logiken i en Firestore-transaktion (`runTransaction`) för att garantera att läsning och skrivning sker som en enda, odelbar operation.

- **[RISK FÖR INKONSEKVENS] Felhantering saknas vid användarskapande:**
    - **Beskrivning:** Bakgrundsfunktionen `onusercreate` har ingen felhantering om skrivningen till databasen misslyckas.
    - **Risk:** En Auth-användare kan existera utan en databasprofil, vilket bryter applikationslogiken.
    - **Åtgärd:** Lägg till en `try/catch`-block och logga felet aggressivt (t.ex. med `logger.error`). Fundera på en strategi för "self-healing" eller manuell uppföljning för dessa fall.

#### **5.1 - 5.4: Planerad Härdning**

- [ ] 5.1: Verifiera bygget med `npx tsc --noEmit` och `npm run build`.
- [ ] 5.2: Implementera juridisk härdning (friskrivningar).
- [ ] 5.3: Implementera teknisk härdning (Rate Limiting).
- [ ] 5.4: Skapa kritiska E2E-tester med Playwright.
